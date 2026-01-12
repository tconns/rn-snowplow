export * from './contracts';
export * from './core';
export * from './providers';
export * from './integrations';
export * from './react';

// User & Session Management - Gọi sau login/logout
export {
    setUserId,
    clearUserData,
    newSession,  // Reset session manually (e.g., after logout)
} from '@snowplow/browser-tracker';

// Privacy & Consent - GDPR compliance
export {
    setOptOutCookie,
    enableAnonymousTracking,
    disableAnonymousTracking,
} from '@snowplow/browser-tracker';

// Buffer Control - Force send trước page unload
export {
    flushBuffer,
} from '@snowplow/browser-tracker';

// Generic Tracking - Events không cần media context  
export {
    trackPageView,
    trackStructEvent,
    trackSelfDescribingEvent,
} from '@snowplow/browser-tracker';

// Context Management - Add/remove global contexts
export {
    addGlobalContexts,
    removeGlobalContexts,
    clearGlobalContexts,
} from '@snowplow/browser-tracker';
