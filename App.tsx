import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NativeSnowplow } from './NativeSnowplow';

interface SnowplowConfig {
  collectorUrl: string;
  appId: string;
  bufferSize: number;
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    flex: 1,
  };

  const [searchTerm, setSearchTerm] = useState('action movies');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('huynhnb@fpt.com');

  const [snowplowConfig, setSnowplowConfig] = useState<SnowplowConfig>({
    collectorUrl: 'http://ec2-3-133-85-131.us-east-2.compute.amazonaws.com:8080',
    appId: 'android-demo-app',
    bufferSize: 1,
  });

  useEffect(() => {
    handleInitialize();
    logEvent('📱 App Started - New Session');
  }, []);

  const logEvent = (name: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`[${timestamp}] ${name}`, ...prev.slice(0, 49)]);
  };

  const handleInitialize = () => {
    try {
      NativeSnowplow.initialize({
        collectorUrl: snowplowConfig.collectorUrl,
        appId: snowplowConfig.appId,
        method: 'post',
      });
      logEvent(`Initialized: ${snowplowConfig.collectorUrl}`);
    } catch (e) {
      logEvent(`Error Init: ${e}`);
    }
  };

  const handleTrack = (name: string, fn: () => void) => {
    try {
      fn();
      logEvent(name);
    } catch (e) {
      logEvent(`Error ${name}: ${e}`);
    }
  };

  const handleSearch = () => {
    handleTrack(`site_search: "${searchTerm}"`, () => {
      NativeSnowplow.trackStructuredEvent('search', 'search', searchTerm, '', 0);
    });
  };

  const handleLogin = () => {
    NativeSnowplow.setUserId(userEmail);
    setIsLoggedIn(true);

    NativeSnowplow.trackStructuredEvent('auth', 'login', userEmail);
    logEvent(`🔐 LOGIN: ${userEmail}`);
    logEvent(`✅ setUserId("${userEmail}")`);
  };

  const handleLogout = () => {
    NativeSnowplow.trackStructuredEvent('auth', 'logout', userEmail);
    logEvent(`🚪 LOGOUT: ${userEmail}`);

    //   NativeSnowplow.flushBuffer();
    logEvent('📤 Events flushing handled automatically');

    NativeSnowplow.setUserId(null);
    logEvent('🗑️ clearUserData() - User ID cleared');

    NativeSnowplow.startNewSession();
    logEvent('🔄 newSession() - New session started');

    setIsLoggedIn(false);
  };

  const handleAppClose = () => {
    NativeSnowplow.trackStructuredEvent('app', 'close', 'user_initiated');
    //   NativeSnowplow.flushBuffer();
    logEvent('📴 App Close - Tracking stop');
  };

  const handleAppResume = () => {
    NativeSnowplow.trackStructuredEvent('app', 'resume', 'foreground');
    logEvent('📱 App Resume');
    if (isLoggedIn) {
      logEvent(`👤 user_id: ${userEmail}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={backgroundStyle} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>

          <View style={styles.header}>
            <Text style={styles.title}>CEP-NEX Demo</Text>
            <Text style={styles.subtitle}>Snowplow Simulator</Text>
            <Text style={styles.author}>Author: huynhnb@fpt.com</Text>
          </View>

          {/* Config Panel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collector Config</Text>
            <TextInput
              style={styles.input}
              value={snowplowConfig.collectorUrl}
              onChangeText={t => setSnowplowConfig(p => ({ ...p, collectorUrl: t }))}
              placeholder="Collector URL"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={snowplowConfig.appId}
                onChangeText={t => setSnowplowConfig(p => ({ ...p, appId: t }))}
                placeholder="App ID"
              />
              <TextInput
                style={[styles.input, { width: 60 }]}
                value={String(snowplowConfig.bufferSize)}
                keyboardType="numeric"
                onChangeText={t => setSnowplowConfig(p => ({ ...p, bufferSize: Number(t) || 1 }))}
              />
            </View>
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleInitialize}>
              <Text style={styles.buttonText}>Re-Initialize</Text>
            </TouchableOpacity>
          </View>

          {/* Session Panel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔐 User Session</Text>
            <TextInput
              style={styles.input}
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="Email..."
              editable={!isLoggedIn}
            />
            <View style={styles.row}>
              {!isLoggedIn ? (
                <TouchableOpacity style={[styles.button, styles.btnGreen, { flex: 1 }]} onPress={handleLogin}>
                  <Text style={styles.buttonTextSmall}>🔓 LOGIN</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.button, styles.btnRed, { flex: 1 }]} onPress={handleLogout}>
                  <Text style={styles.buttonTextSmall}>🚪 LOGOUT</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: isLoggedIn ? '#4caf50' : '#9e9e9e' }]} />
              <Text style={styles.statusText}>{isLoggedIn ? `Logged in: ${userEmail}` : 'Not logged in'}</Text>
            </View>

            <View style={[styles.row, { marginTop: 10 }]}>
              <SimButton onPress={handleAppClose} label="📴 Close" />
              <SimButton onPress={handleAppResume} label="📱 Resume" />
            </View>
          </View>

          {/* Navigation Events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation</Text>
            <View style={styles.grid}>
              <SimButton onPress={() => handleTrack('screen_view: HomePage', () => NativeSnowplow.trackScreenView('HomePage'))} label="Home View" />
              <SimButton onPress={() => handleTrack('screen_view: DetailsPage', () => NativeSnowplow.trackScreenView('DetailsPage'))} label="Details View" />
              <SimButton onPress={() => handleTrack('struct: nav.click', () => NativeSnowplow.trackStructuredEvent('navigation', 'click', 'tab_media'))} label="Tabs Click" />
              <SimButton onPress={() => handleTrack('screen_view: Settings', () => NativeSnowplow.trackScreenView('SettingsPage'))} label="Settings" />
            </View>
          </View>

          {/* Carousel Events */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carousel & Content</Text>
            <View style={styles.grid}>
              <SimButton onPress={() => handleTrack('screen_view: Carousel', () => NativeSnowplow.trackScreenView('CarouselPage'))} label="Carousel Page" />
              <SimButton onPress={() => handleTrack('struct: carousel.swipe', () => NativeSnowplow.trackStructuredEvent('carousel', 'swipe', 'hero_banner'))} label="Swipe Carousel" />
              <SimButton onPress={() => handleTrack('struct: content.hover', () => NativeSnowplow.trackStructuredEvent('content', 'hover', 'movie-123'))} label="Hover Card" />
              <SimButton onPress={() => handleTrack('struct: content.click', () => NativeSnowplow.trackStructuredEvent('content', 'click', 'movie-123'))} label="Click Card" />
            </View>
          </View>

          {/* Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search..."
              />
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSearch}>
                <Text style={styles.buttonTextSmall}>TRACK</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logs */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>Event Log</Text>
              <TouchableOpacity onPress={() => setEventLog([])}>
                <Text style={{ color: '#666', fontSize: 12 }}>Clear</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logBox} nestedScrollEnabled={true}>
              {eventLog.length === 0 ? (
                <Text style={styles.logGray}>No events yet...</Text>
              ) : (
                eventLog.map((log, i) => (
                  <Text key={i} style={styles.logText}>{log}</Text>
                ))
              )}
            </ScrollView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const SimButton = ({ onPress, label }: { onPress: () => void, label: string }) => (
  <TouchableOpacity onPress={onPress} style={styles.simButton}>
    <View style={styles.simDot} />
    <Text style={styles.simBtnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { padding: 20, backgroundColor: '#2196f3', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#e3f2fd', marginBottom: 4 },
  author: { color: '#bbdefb', fontSize: 12, fontStyle: 'italic' },
  section: { padding: 16, backgroundColor: 'white', marginBottom: 8, marginHorizontal: 16, borderRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 8, marginBottom: 10, color: '#333' },
  row: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  button: { padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonPrimary: { backgroundColor: '#1976d2', padding: 10, borderRadius: 6, alignItems: 'center' },
  btnGreen: { backgroundColor: '#4caf50' },
  btnRed: { backgroundColor: '#f44336' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  buttonTextSmall: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#333' },
  simButton: { width: '48%', backgroundColor: '#f5f5f5', padding: 10, borderRadius: 6, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  simDot: { width: 6, height: 6, backgroundColor: '#4caf50', borderRadius: 3, marginRight: 6, opacity: 0.7 },
  simBtnText: { fontSize: 12, color: '#333', fontWeight: '500' },
  logBox: { backgroundColor: '#263238', padding: 10, borderRadius: 4, height: 200 },
  logText: { color: '#00e676', fontFamily: 'monospace', fontSize: 10, marginBottom: 2 },
  logGray: { color: '#78909c', fontStyle: 'italic', fontSize: 12 },
});

export default App;
