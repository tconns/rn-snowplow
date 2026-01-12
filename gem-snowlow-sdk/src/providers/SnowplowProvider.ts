import { 
    newTracker, BrowserTracker, addGlobalContexts, 
    trackPageView, trackStructEvent, trackSelfDescribingEvent
} from '@snowplow/browser-tracker';
import { 
    SnowplowMediaPlugin, startMediaTracking, endMediaTracking, updateMediaTracking,
    trackMediaReady, trackMediaPlay, trackMediaPause, trackMediaEnd, 
    trackMediaSeekStart, trackMediaSeekEnd, trackMediaBufferStart, trackMediaBufferEnd, 
    trackMediaQualityChange, trackMediaError, trackMediaPlaybackRateChange, 
    trackMediaVolumeChange, trackMediaFullscreenChange, trackMediaPictureInPictureChange,
    trackMediaAdStart, trackMediaAdComplete, trackMediaAdBreakStart, trackMediaAdBreakEnd,
    trackMediaAdSkip, trackMediaAdClick, trackMediaAdPause, trackMediaAdResume,
    trackMediaAdFirstQuartile, trackMediaAdMidpoint, trackMediaAdThirdQuartile,
    trackMediaSelfDescribingEvent
} from '@snowplow/browser-plugin-media';
import { IMediaAnalytics, IAppAnalytics, MediaSessionMetadata, PlayerState } from '../contracts';

export interface SnowplowConfig {
    /** URL của Snowplow Collector */
    collectorUrl: string;
    /** ID ứng dụng */
    appId: string;
    /** Bật/tắt tracking (mặc định: true) */
    enableTracking?: boolean;
    /** Bật console log debug (mặc định: false) */
    enableDebug?: boolean;
    
    // Batching & Performance
    /** Số events gom nhóm trước khi gửi (mặc định: 1 - gửi ngay) */
    bufferSize?: number;
    /** Dung lượng tối đa mỗi POST request (bytes, mặc định: 40000) */
    maxPostBytes?: number;
    /** Dung lượng tối đa mỗi GET request (bytes) - events lớn hơn sẽ gửi POST */
    maxGetBytes?: number;
    /** Phương thức gửi: 'post' | 'get' (mặc định: 'post') */
    eventMethod?: 'post' | 'get';
    /** Mã hóa Base64 cho entities (mặc định: true cho GET, false cho POST) */
    encodeBase64?: boolean;
    /** Custom headers gửi kèm request */
    customHeaders?: Record<string, string>;
    
    // Cookie & Storage
    /** Tên cookie (mặc định: '_sp_') */
    cookieName?: string;
    /** Domain cookie (mặc định: auto-detect) */
    cookieDomain?: string;
    /** Thời gian sống cookie (giây, mặc định: 63072000 = 2 năm) */
    cookieLifetime?: number;
    /** Lưu cookie ở SameSite mode: 'None' | 'Lax' | 'Strict' */
    cookieSameSite?: 'None' | 'Lax' | 'Strict';
    /** Chỉ gửi cookie qua HTTPS */
    cookieSecure?: boolean;
    /** Dùng localStorage thay vì cookie */
    stateStorageStrategy?: 'cookie' | 'localStorage' | 'cookieAndLocalStorage' | 'none';
    
    // Session
    /** Thời gian session timeout (giây, mặc định: 1800 = 30 phút) */
    sessionCookieTimeout?: number;
    
    // Privacy & Credentials
    /** Ẩn danh IP người dùng */
    anonymousTracking?: boolean | { withSessionTracking?: boolean; withServerAnonymisation?: boolean };
    /** Tự động detect root domain (mặc định: true) */
    discoverRootDomain?: boolean;
    
    // Contexts - Entities gửi kèm mỗi event
    /** Gửi thông tin page (mặc định: true) */
    webPage?: boolean;
    /** Gửi session entity (mặc định: false) */
    session?: boolean;
    /** Gửi browser entity (mặc định: false) */
    browser?: boolean;
}

export class SnowplowProvider implements IMediaAnalytics, IAppAnalytics {
    private static inst: SnowplowProvider;
    private tracker: BrowserTracker | null = null;
    private mediaId: string | null = null;
    private ready = false;
    private cfg: SnowplowConfig = { collectorUrl: '', appId: '' };

    private constructor() {}

    static getInstance() {
        if (!SnowplowProvider.inst) SnowplowProvider.inst = new SnowplowProvider();
        return SnowplowProvider.inst;
    }

    initialize(cfg: SnowplowConfig) {
        if (this.ready) return;
        this.cfg = { enableTracking: true, enableDebug: false, ...cfg };
        try {
            this.tracker = newTracker('sp', this.cfg.collectorUrl, {
                appId: this.cfg.appId,
                plugins: [SnowplowMediaPlugin()],
                
                // Event method & batching
                eventMethod: (cfg.eventMethod || 'post') as 'post' | 'get',
                bufferSize: cfg.bufferSize || 1,
                maxPostBytes: cfg.maxPostBytes || 40000,
                encodeBase64: cfg.encodeBase64,
                customHeaders: cfg.customHeaders,
                
                // Cookies
                cookieName: cfg.cookieName || '_sp_',
                cookieDomain: cfg.cookieDomain,
                cookieLifetime: cfg.cookieLifetime || 63072000,
                cookieSameSite: cfg.cookieSameSite || 'Lax',
                cookieSecure: cfg.cookieSecure || false,
                stateStorageStrategy: cfg.stateStorageStrategy || 'cookieAndLocalStorage',
                
                // Session
                sessionCookieTimeout: cfg.sessionCookieTimeout || 1800,
                
                // Privacy
                anonymousTracking: cfg.anonymousTracking || false,
                discoverRootDomain: cfg.discoverRootDomain !== false,
                
                // Contexts - Entities
                contexts: { 
                    webPage: cfg.webPage !== false,
                    session: cfg.session || false,
                    browser: cfg.browser || false,
                }
            }) || null;
            this.ready = true;
            this.log('Initialized', this.cfg);
        } catch (e) {
            console.error('[Snowplow] Init failed:', e);
        }
    }

    private log(msg: string, ...a: unknown[]) { if (this.cfg.enableDebug) console.log(`[Snowplow] ${msg}`, ...a); }
    private ok() { return this.ready && this.cfg.enableTracking; }

    setGlobalContext(ctx: Record<string, unknown>) {
        if (!this.ready) return;
        try { addGlobalContexts([ctx as any]); } catch (e) { console.error('[Snowplow] Context failed:', e); }
    }

    trackPageView(title?: string) { if (this.ok()) trackPageView({ title }); }
    trackStructEvent(cat: string, act: string, lbl?: string, val?: number) { if (this.ok()) trackStructEvent({ category: cat, action: act, label: lbl, value: val }); }
    trackScreenView(name: string, id?: string) {
        if (this.ok()) trackSelfDescribingEvent({ event: { schema: 'iglu:com.snowplowanalytics.snowplow/screen_view/jsonschema/1-0-0', data: { name, id } } });
    }
    trackSelfDescribingEvent(schema: string, data: Record<string, unknown>) {
        if (this.ok()) trackSelfDescribingEvent({ event: { schema, data } });
    }
    trackSiteSearch(terms: string[], filters?: Record<string, unknown>, total?: number) {
        if (this.ok()) trackSelfDescribingEvent({ event: { schema: 'iglu:com.snowplowanalytics.snowplow/site_search/jsonschema/1-0-0', data: { terms, filters, total_results: total } } });
    }

    startMediaSession(id: string, m: MediaSessionMetadata) {
        if (!this.ready) return;
        if (this.mediaId) try { endMediaTracking({ id: this.mediaId }); } catch {}
        try {
            startMediaTracking({ 
                id, 
                player: { 
                    label: m.label || 'player',
                    playerType: m.playerType || 'VIDEO'
                } 
            });
            this.mediaId = id;
            trackMediaReady({ id });
            this.log('Session:', id);
        } catch (e) { console.error('[Snowplow] Session failed:', e); }
    }

    trackPlay() { 
        this.log('Play called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaPlay({ id: this.mediaId }); 
    }
    trackPause() { 
        this.log('Pause called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaPause({ id: this.mediaId }); 
    }
    trackEnd() { 
        this.log('End called, mediaId:', this.mediaId);
        if (this.mediaId) { trackMediaEnd({ id: this.mediaId }); this.mediaId = null; } 
    }
    trackSeekStart() { 
        this.log('SeekStart called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaSeekStart({ id: this.mediaId }); 
    }
    trackSeekEnd() { 
        this.log('SeekEnd called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaSeekEnd({ id: this.mediaId }); 
    }
    trackBufferStart() { 
        this.log('BufferStart called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaBufferStart({ id: this.mediaId }); 
    }
    trackBufferEnd() { 
        this.log('BufferEnd called, mediaId:', this.mediaId);
        if (this.mediaId) trackMediaBufferEnd({ id: this.mediaId }); 
    }
    trackQualityChange(bitrate: number, height: number, width: number) { 
        if (this.mediaId) trackMediaQualityChange({ id: this.mediaId, newQuality: `${height}p`, bitrate, framesPerSecond: 0 }); 
    }
    trackAudioChange(label: string, language: string, previousLabel?: string, previousLanguage?: string) {
        if (this.mediaId) trackMediaSelfDescribingEvent({ 
            id: this.mediaId, 
            event: { 
                schema: 'iglu:com.sony.snowplow.media/audio_track_change/jsonschema/1-0-0', 
                data: { label, language, previousLabel, previousLanguage } 
            } 
        });
    }
    trackSubtitleChange(label: string, language: string, enabled?: boolean, previousLabel?: string, previousLanguage?: string) {
        if (this.mediaId) trackMediaSelfDescribingEvent({ 
            id: this.mediaId, 
            event: { 
                schema: 'iglu:com.sony.snowplow.media/subtitle_change/jsonschema/1-0-0', 
                data: { label, language, enabled, previousLabel, previousLanguage } 
            } 
        });
    }
    trackError(code: string, msg: string) { if (this.mediaId) trackMediaError({ id: this.mediaId, errorCode: code, errorDescription: msg }); }
    updatePlaybackRate(r: number) { if (this.mediaId) trackMediaPlaybackRateChange({ id: this.mediaId, newRate: r }); }
    updateVolume(v: number) { if (this.mediaId) trackMediaVolumeChange({ id: this.mediaId, newVolume: v * 100 }); }
    updatePlayerState(s: PlayerState) {
        if (!this.mediaId) return;
        updateMediaTracking({ id: this.mediaId, player: { currentTime: s.currentTime, duration: s.duration, ended: false, muted: s.muted, paused: s.paused, playbackRate: s.playbackRate, volume: s.volume * 100 } });
    }
    trackFullscreenChange(fs: boolean) { if (this.mediaId) trackMediaFullscreenChange({ id: this.mediaId, fullscreen: fs }); }
    trackPictureInPictureChange(pip: boolean) { if (this.mediaId) trackMediaPictureInPictureChange({ id: this.mediaId, pictureInPicture: pip }); }
    trackPercentProgress(percentProgress: number) {
        if (this.mediaId) trackMediaSelfDescribingEvent({ 
            id: this.mediaId, 
            event: { 
                schema: 'iglu:com.snowplowanalytics.snowplow.media/percent_progress_event/jsonschema/1-0-0', 
                data: { percentProgress } 
            } 
        });
    }
    trackAdStart(adId: string, _t: string, dur: number, skip?: number) { if (this.mediaId) trackMediaAdStart({ id: this.mediaId, ad: { adId, duration: dur, skippable: skip !== undefined } }); }
    trackAdEnd() { if (this.mediaId) trackMediaAdComplete({ id: this.mediaId }); }
    trackAdBreakStart(breakId: string, breakType: string, st: number) { if (this.mediaId) trackMediaAdBreakStart({ id: this.mediaId, adBreak: { breakId, breakType: breakType as any, startTime: st } }); }
    trackAdBreakEnd() { if (this.mediaId) trackMediaAdBreakEnd({ id: this.mediaId }); }
    trackAdSkip() { if (this.mediaId) trackMediaAdSkip({ id: this.mediaId }); }
    trackAdClick() { if (this.mediaId) trackMediaAdClick({ id: this.mediaId }); }
    trackAdPause() { if (this.mediaId) trackMediaAdPause({ id: this.mediaId }); }
    trackAdResume() { if (this.mediaId) trackMediaAdResume({ id: this.mediaId }); }
    trackAdQuartile(q: 'first' | 'midpoint' | 'third') {
        if (!this.mediaId) return;
        const p = { id: this.mediaId };
        if (q === 'first') trackMediaAdFirstQuartile(p);
        else if (q === 'midpoint') trackMediaAdMidpoint(p);
        else trackMediaAdThirdQuartile(p);
    }
}
