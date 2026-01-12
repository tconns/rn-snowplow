import { IMediaAnalytics, MediaSessionMetadata } from '../contracts';

export interface MediaTrackingMetadata {
    label?: string;
    playerType?: string;
    mediaType?: string;
}

export class MediaTracker {
    private el: HTMLVideoElement;
    private svc: IMediaAnalytics;
    private id: string;
    private meta: MediaTrackingMetadata;
    private started = false;
    private progress = { 25: false, 50: false, 75: false };
    private lastUpdate = 0;
    private isBuffering = false;
    private lastPlayFired = 0;

    constructor(el: HTMLVideoElement, id: string, svc: IMediaAnalytics, meta: MediaTrackingMetadata = {}) {
        this.el = el;
        this.id = id;
        this.svc = svc;
        this.meta = meta;
    }

    get service() { return this.svc; }

    initialize() {
        if (!this.el) return;
        // Start session immediately so all events (including seek before play) have mediaId
        this.startSession();
        this.attach();
        if (!this.el.paused && !this.el.ended) {
            this.svc.trackPlay();
        }
    }

    dispose() {
        if (!this.el) return;
        this.detach();
        this.svc.trackEnd();
    }

    private attach() {
        ['play', 'pause', 'ended', 'seeking', 'seeked', 'waiting', 'playing', 'canplaythrough',
         'error', 'ratechange', 'volumechange', 'enterpictureinpicture', 'leavepictureinpicture'
        ].forEach(e => this.el.addEventListener(e, this.onEvent));
        this.el.addEventListener('timeupdate', this.onTime);
        document.addEventListener('fullscreenchange', this.onFullscreen);
    }

    private detach() {
        ['play', 'pause', 'ended', 'seeking', 'seeked', 'waiting', 'playing', 'canplaythrough',
         'error', 'ratechange', 'volumechange', 'enterpictureinpicture', 'leavepictureinpicture'
        ].forEach(e => this.el.removeEventListener(e, this.onEvent));
        this.el.removeEventListener('timeupdate', this.onTime);
        document.removeEventListener('fullscreenchange', this.onFullscreen);
    }

    private onEvent = (e: Event) => {
        const now = Date.now();
        const actions: Record<string, () => void> = {
            play: () => {
                // Debounce play events (prevent duplicate from play + playing)
                if (now - this.lastPlayFired < 200) return;
                this.lastPlayFired = now;
                this.svc.trackPlay();
            },
            playing: () => {
                // End buffering when playback resumes
                if (this.isBuffering) {
                    this.isBuffering = false;
                    this.svc.trackBufferEnd();
                }
                // Debounce (may fire after 'play')
                if (now - this.lastPlayFired < 200) return;
                this.lastPlayFired = now;
                this.svc.trackPlay();
            },
            canplaythrough: () => {
                // Also end buffering on canplaythrough
                if (this.isBuffering) {
                    this.isBuffering = false;
                    this.svc.trackBufferEnd();
                }
            },
            pause: () => !this.el.ended && this.svc.trackPause(),
            ended: () => { this.svc.trackEnd(); this.started = false; this.progress = { 25: false, 50: false, 75: false }; },
            seeking: () => this.svc.trackSeekStart(),
            seeked: () => this.svc.trackSeekEnd(),
            waiting: () => {
                if (!this.isBuffering) {
                    this.isBuffering = true;
                    this.svc.trackBufferStart();
                }
            },
            ratechange: () => this.svc.updatePlaybackRate(this.el.playbackRate),
            volumechange: () => this.svc.updateVolume(this.el.volume),
            enterpictureinpicture: () => this.svc.trackPictureInPictureChange(true),
            leavepictureinpicture: () => this.svc.trackPictureInPictureChange(false),
            error: () => {
                const err = (this.el as any).error;
                if (err) this.svc.trackError(String(err.code), err.message);
            }
        };
        actions[e.type]?.();
    };

    private onFullscreen = () => {
        const fs = !!document.fullscreenElement && 
            (document.fullscreenElement === this.el || document.fullscreenElement.contains(this.el));
        this.svc.trackFullscreenChange(fs);
    };

    private onTime = () => {
        const now = Date.now();
        if (now - this.lastUpdate < 1000) return;
        this.lastUpdate = now;

        const { currentTime: t, duration: d } = this.el;
        if (d > 0) {
            const pct = (t / d) * 100;
            [25, 50, 75].forEach(p => {
                if (pct >= p && !this.progress[p as 25|50|75]) {
                    this.svc.trackPercentProgress(p);
                    this.progress[p as 25|50|75] = true;
                }
            });
        }

        this.svc.updatePlayerState({
            currentTime: t, duration: d || 0, paused: this.el.paused,
            muted: this.el.muted, volume: this.el.volume, playbackRate: this.el.playbackRate
        });
    };

    private startSession() {
        if (this.started) return; // Prevent re-initialization
        this.svc.startMediaSession(this.id, {
            label: this.meta.label || document.title,
            mediaType: this.meta.mediaType || 'video',
            dimensions: { width: this.el.videoWidth, height: this.el.videoHeight }
        });
        this.started = true;
    }

    notifyAdStart(id: string, type: string, dur: number, skip?: number) { this.svc.trackAdStart(id, type, dur, skip); }
    notifyAdEnd() { this.svc.trackAdEnd(); }
    notifyAdBreakStart(id: string, type: string, t: number) { this.svc.trackAdBreakStart(id, type, t); }
    notifyAdBreakEnd() { this.svc.trackAdBreakEnd(); }
    notifyAdSkip() { this.svc.trackAdSkip(); }
    notifyAdClick(url?: string) { this.svc.trackAdClick(url); }
    notifyAdPause() { this.svc.trackAdPause(); }
    notifyAdResume() { this.svc.trackAdResume(); }
    notifyAdQuartile(q: 'first' | 'midpoint' | 'third') { this.svc.trackAdQuartile(q); }
    notifyQualityChange(br: number, h: number, w: number) { this.svc.trackQualityChange(br, h, w); }
    notifyAudioChange(l: string, lang: string) { this.svc.trackAudioChange(l, lang); }
    notifySubtitleChange(l: string, lang: string) { this.svc.trackSubtitleChange(l, lang); }
    notifyError(code: string, msg: string) { this.svc.trackError(code, msg); }
}
