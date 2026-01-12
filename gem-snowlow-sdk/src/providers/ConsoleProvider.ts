import { IMediaAnalytics, IAppAnalytics, MediaSessionMetadata, PlayerState } from '../contracts';

export class ConsoleProvider implements IMediaAnalytics, IAppAnalytics {
    private ctx: Record<string, unknown> = {};

    private log(evt: string, data?: unknown) {
        if (process.env.NODE_ENV !== 'development') return;
        const t = new Date().toLocaleTimeString();
        console.groupCollapsed(`%c[Analytics] ${evt} @ ${t}`, 'color: #3b82f6; font-weight: bold;');
        if (Object.keys(this.ctx).length) console.log('Context:', this.ctx);
        if (data) console.log('Data:', data);
        console.groupEnd();
    }

    setGlobalContext(ctx: Record<string, unknown>) { this.ctx = { ...this.ctx, ...ctx }; this.log('Context', ctx); }
    trackPageView(title?: string) { this.log('PageView', { title, url: location.href }); }
    trackStructEvent(cat: string, act: string, lbl?: string, val?: number) { this.log('Event', { cat, act, lbl, val }); }
    trackScreenView(name: string, id?: string) { this.log('Screen', { name, id }); }
    trackSelfDescribingEvent(schema: string, data: Record<string, unknown>) { this.log('SDE', { schema, data }); }
    trackSiteSearch(terms: string[], filters?: Record<string, unknown>, total?: number) { this.log('Search', { terms, filters, total }); }
    startMediaSession(id: string, m: MediaSessionMetadata) { this.log('Session', { id, m }); }
    trackPlay() { this.log('Play'); }
    trackPause() { this.log('Pause'); }
    trackEnd() { this.log('End'); }
    trackSeekStart() { this.log('SeekStart'); }
    trackSeekEnd() { this.log('SeekEnd'); }
    trackBufferStart() { this.log('BufferStart'); }
    trackBufferEnd() { this.log('BufferEnd'); }
    trackQualityChange(br: number, h: number, w: number) { this.log('Quality', { br, h, w }); }
    trackAudioChange(l: string, lang: string) { this.log('Audio', { l, lang }); }
    trackSubtitleChange(l: string, lang: string) { this.log('Subtitle', { l, lang }); }
    trackError(code: string, msg: string) { console.error(`[Analytics] ${code}: ${msg}`); }
    updatePlaybackRate(r: number) { this.log('Rate', r); }
    updateVolume(v: number) { this.log('Volume', v); }
    trackFullscreenChange(fs: boolean) { this.log('Fullscreen', fs); }
    trackPictureInPictureChange(pip: boolean) { this.log('PiP', pip); }
    updatePlayerState(_: PlayerState) {}
    trackPercentProgress(pct: number) { this.log('Progress', `${pct}%`); }
    trackAdStart(id: string, t: string, d: number, skip?: number) { this.log('AdStart', { id, t, d, skip }); }
    trackAdEnd() { this.log('AdEnd'); }
    trackAdBreakStart(id: string, t: string, st: number) { this.log('AdBreakStart', { id, t, st }); }
    trackAdBreakEnd() { this.log('AdBreakEnd'); }
    trackAdSkip() { this.log('AdSkip'); }
    trackAdClick(url?: string) { this.log('AdClick', url); }
    trackAdPause() { this.log('AdPause'); }
    trackAdResume() { this.log('AdResume'); }
    trackAdQuartile(q: 'first' | 'midpoint' | 'third') { this.log('AdQuartile', q); }
}
