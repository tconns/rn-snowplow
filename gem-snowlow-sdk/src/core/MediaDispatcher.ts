import { IMediaAnalytics, MediaSessionMetadata, PlayerState } from '../contracts';

type Fn<T> = (p: T) => void;

export class MediaDispatcher implements IMediaAnalytics {
    constructor(private providers: IMediaAnalytics[]) {}

    private dispatch(fn: Fn<IMediaAnalytics>, eventName?: string) {
        this.providers.forEach((p, i) => { 
            try { 
                fn(p); 
            } catch (e) { 
                console.warn(`[MediaDispatcher] Error in provider ${i} for ${eventName}:`, e); 
            } 
        });
    }

    startMediaSession = (id: string, m: MediaSessionMetadata) => this.dispatch(p => p.startMediaSession(id, m));
    trackPlay = () => this.dispatch(p => p.trackPlay());
    trackPause = () => this.dispatch(p => p.trackPause());
    trackEnd = () => this.dispatch(p => p.trackEnd());
    trackSeekStart = () => this.dispatch(p => p.trackSeekStart());
    trackSeekEnd = () => this.dispatch(p => p.trackSeekEnd());
    trackBufferStart = () => this.dispatch(p => p.trackBufferStart());
    trackBufferEnd = () => this.dispatch(p => p.trackBufferEnd());
    trackQualityChange = (br: number, h: number, w: number) => this.dispatch(p => p.trackQualityChange(br, h, w));
    trackAudioChange = (l: string, lang: string) => this.dispatch(p => p.trackAudioChange(l, lang));
    trackSubtitleChange = (l: string, lang: string) => this.dispatch(p => p.trackSubtitleChange(l, lang));
    setGlobalContext = (ctx: Record<string, unknown>) => this.dispatch(p => p.setGlobalContext(ctx));
    trackError = (code: string, msg: string) => this.dispatch(p => p.trackError(code, msg));
    updatePlaybackRate = (r: number) => this.dispatch(p => p.updatePlaybackRate(r));
    updateVolume = (v: number) => this.dispatch(p => p.updateVolume(v));
    trackFullscreenChange = (fs: boolean) => this.dispatch(p => p.trackFullscreenChange(fs));
    trackPictureInPictureChange = (pip: boolean) => this.dispatch(p => p.trackPictureInPictureChange(pip));
    updatePlayerState = (s: PlayerState) => this.dispatch(p => p.updatePlayerState(s));
    trackPercentProgress = (pct: number) => this.dispatch(p => p.trackPercentProgress(pct));
    trackAdStart = (id: string, t: string, d: number, skip?: number) => this.dispatch(p => p.trackAdStart(id, t, d, skip));
    trackAdEnd = () => this.dispatch(p => p.trackAdEnd());
    trackAdBreakStart = (id: string, t: string, st: number) => this.dispatch(p => p.trackAdBreakStart(id, t, st));
    trackAdBreakEnd = () => this.dispatch(p => p.trackAdBreakEnd());
    trackAdSkip = () => this.dispatch(p => p.trackAdSkip());
    trackAdClick = (url?: string) => this.dispatch(p => p.trackAdClick(url));
    trackAdPause = () => this.dispatch(p => p.trackAdPause());
    trackAdResume = () => this.dispatch(p => p.trackAdResume());
    trackAdQuartile = (q: 'first' | 'midpoint' | 'third') => this.dispatch(p => p.trackAdQuartile(q));
}
