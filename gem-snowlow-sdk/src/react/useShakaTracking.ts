import { useEffect } from 'react';
import { useMediaTracking } from './useMediaTracking';
import { ShakaTracker } from '../integrations/shaka';

export const useShakaTracking = (
    videoRef: React.RefObject<HTMLVideoElement>,
    player: any | null,
    contentId: string,
    metadata?: { title?: string; mediaType?: string; isLive?: boolean }
) => {
    const mediaTracker = useMediaTracking(videoRef, contentId, metadata);

    useEffect(() => {
        if (!player || !mediaTracker) return;

        const shakaTracker = new ShakaTracker(player, mediaTracker.service);

        return () => {
            shakaTracker.dispose();
        };
    }, [player, mediaTracker]);

    return mediaTracker;
};
