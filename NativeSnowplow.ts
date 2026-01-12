import { NativeModules } from 'react-native';

const { SnowplowModule } = NativeModules;

export interface SnowplowConfig {
  collectorUrl: string;
  appId: string;
  method?: 'post' | 'get';
  base64?: boolean;
}

export const NativeSnowplow = {
  initialize: (config: SnowplowConfig) => {
    SnowplowModule.initialize(config);
  },

  trackScreenView: (name: string) => {
    SnowplowModule.trackScreenView(name);
  },

  trackStructuredEvent: (
    category: string,
    action: string,
    label?: string,
    property?: string,
    value?: number
  ) => {
    SnowplowModule.trackStructuredEvent(category, action, label, property, value);
  },

  trackSelfDescribingEvent: (schema: string, data: Record<string, any>) => {
    SnowplowModule.trackSelfDescribingEvent(schema, data);
  },

  setUserId: (userId: string | null) => {
    SnowplowModule.setUserId(userId);
  },

  startNewSession: () => {
    SnowplowModule.startNewSession();
  },

  flushBuffer: () => {
    SnowplowModule.flushBuffer();
  },
};
