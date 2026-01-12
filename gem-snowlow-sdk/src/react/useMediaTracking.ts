import { useEffect, useState } from 'react';
import { MediaTracker, MediaTrackingMetadata } from '../core';
import { MediaDispatcher } from '../core';
import { SnowplowProvider } from '../providers';
import { ConsoleProvider } from '../providers';

export const useMediaTracking = (
    videoRef: React.RefObject<HTMLVideoElement>,
    contentId: string,
    metadata?: { title?: string; mediaType?: string; isLive?: boolean }
) => {
    const [tracker, setTracker] = useState<MediaTracker | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement) {
            const trackerMetadata: MediaTrackingMetadata = {
                label: metadata?.title,
                mediaType: metadata?.mediaType || (metadata?.isLive ? 'live' : 'video'),
            };

            const snowplowService = SnowplowProvider.getInstance();
            const consoleService = new ConsoleProvider();
            
            const dispatcher = new MediaDispatcher([
                consoleService,
                snowplowService
            ]);

            const newTracker = new MediaTracker(videoElement, contentId, dispatcher, trackerMetadata);
            newTracker.initialize();
            
            setTracker(newTracker);
            console.log('[useMediaTracking] Tracker Initialized');

            return () => {
                newTracker.dispose();
                console.log('[useMediaTracking] Tracker Disposed');
            };
        }
    }, [videoRef, contentId, metadata?.title, metadata?.mediaType, metadata?.isLive]);

    return tracker;
};
