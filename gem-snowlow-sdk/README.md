# @gem/snowplow-sdk

A robust Snowplow Analytics SDK designed for React applications, with specialized support for Shaka Player media tracking.

## Features

- 🚀 **Easy Integration**: Hooks-based API for React.
- 📹 **Media Tracking**: Full support for video/audio tracking (Play, Pause, Seek, Buffer, Quality, Ads).
- 🧩 **Modular Design**: Separate `contracts`, `core`, and `providers` layers.
- 🔌 **Shaka Player Support**: Built-in integration for automatic Shaka Player event tracking.
- 🛡️ **TypeScript**: Written in TypeScipt with complete type definitions.

## Installation

```bash
npm install @gem/snowplow-sdk
# or
yarn add @gem/snowplow-sdk
```

## Setup

Initialize the SDK early in your application lifecycle (e.g., in `App.tsx` or `index.tsx`).

```typescript
import { SnowplowProvider } from '@gem/snowplow-sdk';

SnowplowProvider.getInstance().initialize({
    collectorUrl: 'https://your-collector-url.com',
    appId: 'your-app-id',
    enableTracking: true,
    enableDebug: true, // Enable to see logs in console
    bufferSize: 5,     // Batch 5 events before sending
});
```

## Usage

### 1. Basic Page & Event Tracking

```typescript
import { SnowplowProvider } from '@gem/snowplow-sdk';

const analytics = SnowplowProvider.getInstance();

// Track Page View
analytics.trackPageView('Home Page');

// Track Custom Event
analytics.trackStructEvent('Category', 'Action', 'Label', 100);
```

### 2. Video Tracking (with Shaka Player)

Use the `useShakaTracking` hook to automatically track all player events.

```typescript
import React, { useRef, useEffect } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui';
import { useShakaTracking } from '@gem/snowplow-sdk';

const VideoPlayer = ({ contentId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [player, setPlayer] = useState<shaka.Player | null>(null);

    // Initialize Shaka Player (simplified)
    useEffect(() => {
        const p = new shaka.Player(videoRef.current);
        setPlayer(p);
        return () => p.destroy();
    }, []);

    // 🚀 ONE LINE TO TRACK THEM ALL
    useShakaTracking(videoRef, player, contentId, {
        title: 'Big Buck Bunny',
        mediaType: 'video',
        isLive: false
    });

    return <video ref={videoRef} controls />;
};
```

## Architecture

The SDK follows a clean architecture pattern:

*   **Contracts**: Interfaces (`IMediaAnalytics`, `IAppAnalytics`) defining the tracking contract.
*   **Core**:
    *   `MediaTracker`: Auto-detects HTML5 video events (play, pause, seek, buffer...).
    *   `MediaDispatcher`: Fans out events to multiple providers (e.g., Snowplow + Console).
*   **Providers**:
    *   `SnowplowProvider`: Wrapper around `@snowplow/browser-tracker` & `@snowplow/browser-plugin-media`.
    *   `ConsoleProvider`: Logs events to console for debugging.

## Supported Events

| Event | Trigger |
|-------|---------|
| `play` | User presses play |
| `pause` | User presses pause |
| `end` | Video finishes |
| `seek_start` | User starts scrubbing time |
| `seek_end` | User releases scrubbing |
| `buffer_start` | Video buffers (loading) |
| `buffer_end` | Buffering finishes |
| `quality_change` | Adaptive bitrate changes resolution |
| `percent_progress` | Reaches 25%, 50%, 75% |
| `ad_start/end` | Ad events (if integrated) |

## Build

To build the SDK locally:

```bash
yarn install
yarn build
```
