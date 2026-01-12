export interface MediaSessionMetadata {
    label?: string;
    playerType?: string;
    mediaType?: string;
    dimensions?: { width: number; height: number };
}

export interface PlayerState {
    currentTime: number;
    duration: number;
    paused: boolean;
    muted: boolean;
    volume: number;
    playbackRate: number;
}

export interface IMediaAnalytics {
    startMediaSession(id: string, metadata: MediaSessionMetadata): void;
    
    trackPlay(): void;
    trackPause(): void;
    trackEnd(): void;
    trackSeekStart(): void;
    trackSeekEnd(): void;
    trackBufferStart(): void;
    trackBufferEnd(): void;
    
    trackQualityChange(bitrate: number, height: number, width: number): void;
    trackAudioChange(label: string, language: string, previousLabel?: string, previousLanguage?: string): void;
    trackSubtitleChange(label: string, language: string, enabled?: boolean, previousLabel?: string, previousLanguage?: string): void;

    setGlobalContext(context: Record<string, any>): void;
    trackError(errorCode: string, errorMessage: string): void;
    
    updatePlaybackRate(rate: number): void;
    updateVolume(volume: number): void;
    trackFullscreenChange(isFullscreen: boolean): void;
    trackPictureInPictureChange(isPictureInPicture: boolean): void;
    updatePlayerState(state: PlayerState): void;
    
    trackPercentProgress(percent: number): void;
    
    trackAdStart(adId: string, adType: string, duration: number, skipOffset?: number): void;
    trackAdEnd(): void;
    trackAdBreakStart(breakId: string, breakType: string, breakStartTime: number): void;
    trackAdBreakEnd(): void;
    trackAdSkip(): void;
    trackAdClick(url?: string): void;
    trackAdPause(): void;
    trackAdResume(): void;
    trackAdQuartile(quartile: 'first' | 'midpoint' | 'third'): void;
}
