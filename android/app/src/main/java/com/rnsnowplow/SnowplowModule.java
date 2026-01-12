package com.rnsnowplow;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import com.snowplowanalytics.snowplow.Snowplow;
import com.snowplowanalytics.snowplow.configuration.NetworkConfiguration;
import com.snowplowanalytics.snowplow.configuration.TrackerConfiguration;
import com.snowplowanalytics.snowplow.controller.TrackerController;
import com.snowplowanalytics.snowplow.configuration.EmitterConfiguration;
import com.snowplowanalytics.snowplow.emitter.BufferOption;
import com.snowplowanalytics.snowplow.tracker.LogLevel;
import com.snowplowanalytics.snowplow.event.ScreenView;
import com.snowplowanalytics.snowplow.event.SelfDescribing;
import com.snowplowanalytics.snowplow.event.Structured;
import com.snowplowanalytics.snowplow.payload.SelfDescribingJson;
import com.snowplowanalytics.snowplow.network.HttpMethod;

import java.util.HashMap;
import java.util.Map;

public class SnowplowModule extends ReactContextBaseJavaModule {
    private TrackerController tracker;

    SnowplowModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "SnowplowModule";
    }

    @ReactMethod
    public void initialize(ReadableMap config) {
        // Tracker re-initialization allowed to update config (e.g. collectorUrl, appId)

        String collectorUrl = config.getString("collectorUrl");
        String appId = config.getString("appId");
        String method = config.hasKey("method") ? config.getString("method") : "post";

        NetworkConfiguration networkConfig = new NetworkConfiguration(collectorUrl,
                method.equalsIgnoreCase("get") ? HttpMethod.GET : HttpMethod.POST);

        TrackerConfiguration trackerConfig = new TrackerConfiguration(appId)
            .base64encoding(config.hasKey("base64") ? config.getBoolean("base64") : true)
            .platformContext(true)
            .sessionContext(true)
            .logLevel(LogLevel.VERBOSE);

        EmitterConfiguration emitterConfig = new EmitterConfiguration();
        int bufferSize = config.hasKey("bufferSize") ? config.getInt("bufferSize") : 1;
        if (bufferSize > 1) {
            emitterConfig.bufferOption(BufferOption.SmallGroup);
        } else {
            emitterConfig.bufferOption(BufferOption.Single);
        }

        tracker = Snowplow.createTracker(getReactApplicationContext(), 
            "sp", networkConfig, trackerConfig, emitterConfig);
    }

    @ReactMethod
    public void trackScreenView(String name) {
        if (tracker == null) return;
        tracker.track(new ScreenView(name));
    }

    @ReactMethod
    public void trackStructuredEvent(String category, String action, String label, String property, Double value) {
        if (tracker == null) return;
        Structured event = new Structured(category, action);
        if (label != null) event.label(label);
        if (property != null) event.property(property);
        if (value != null) event.value(value);
        tracker.track(event);
    }

    @ReactMethod
    public void trackSelfDescribingEvent(String schema, ReadableMap data) {
        if (tracker == null) return;
        Map<String, Object> payload = toMap(data);
        SelfDescribingJson sdj = new SelfDescribingJson(schema, payload);
        tracker.track(new SelfDescribing(sdj));
    }

    private Map<String, Object> toMap(ReadableMap currentMap) {
        Map<String, Object> result = new HashMap<>();
        ReadableMapKeySetIterator iterator = currentMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (currentMap.getType(key)) {
                case Null:
                    result.put(key, null);
                    break;
                case Boolean:
                    result.put(key, currentMap.getBoolean(key));
                    break;
                case Number:
                    result.put(key, currentMap.getDouble(key));
                    break;
                case String:
                    result.put(key, currentMap.getString(key));
                    break;
                case Map:
                    result.put(key, toMap(currentMap.getMap(key)));
                    break;
                case Array:
                    // Simplified: Assuming simple arrays for now or extend complex logic if needed
                    result.put(key, currentMap.getArray(key).toArrayList());
                    break;
            }
        }
        return result;
    }

    @ReactMethod
    public void setUserId(String userId) {
        if (tracker == null) return;
        tracker.getSubject().setUserId(userId);
    }

    @ReactMethod
    public void startNewSession() {
        if (tracker == null) return;
        tracker.getSession().startNewSession();
    }
}




