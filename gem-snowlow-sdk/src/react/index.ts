import { useEffect, useState } from 'react';
import { MediaTracker, MediaTrackingMetadata, MediaDispatcher, AppDispatcher } from '../core';
import { SnowplowProvider, ConsoleProvider } from '../providers';
import { ShakaTracker } from '../integrations/shaka';

export const useMediaTracking = (
    videoRef: React.RefObject<HTMLVideoElement>,
    contentId: string,
    meta?: { title?: string; mediaType?: string; isLive?: boolean }
) => {
    const [tracker, setTracker] = useState<MediaTracker | null>(null);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;

        const m: MediaTrackingMetadata = {
            label: meta?.title,
            mediaType: meta?.mediaType || (meta?.isLive ? 'live' : 'video'),
        };

        const dispatcher = new MediaDispatcher([
            new ConsoleProvider(),
            SnowplowProvider.getInstance()
        ]);

        const t = new MediaTracker(el, contentId, dispatcher, m);
        t.initialize();
        setTracker(t);

        return () => t.dispose();
    }, [videoRef, contentId, meta?.title, meta?.mediaType, meta?.isLive]);

    return tracker;
};

let appDispatcher: AppDispatcher | null = null;

export const useAppTracking = () => {
    if (!appDispatcher) {
        appDispatcher = new AppDispatcher([
            new ConsoleProvider(),
            SnowplowProvider.getInstance()
        ]);
    }
    return appDispatcher;
};

export const useShakaTracking = (
    videoRef: React.RefObject<HTMLVideoElement>,
    player: any | null,
    contentId: string,
    meta?: { title?: string; mediaType?: string; isLive?: boolean }
) => {
    const tracker = useMediaTracking(videoRef, contentId, meta);

    useEffect(() => {
        if (!player || !tracker) return;
        const st = new ShakaTracker(player, tracker.service);
        return () => st.dispose();
    }, [player, tracker]);

    return tracker;
};
