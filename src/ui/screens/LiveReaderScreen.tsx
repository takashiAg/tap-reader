import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { liveReaderUiAdapter } from '../adapters/liveReaderUiAdapter';
import type {
  UiLanguageId,
  UiRecognitionFrame,
  UiRecognitionMode,
  UiRecognizedToken,
} from '../ports/liveReaderPort';

type CameraSize = {
  width: number;
  height: number;
};

export function LiveReaderScreen() {
  const reader = liveReaderUiAdapter;
  const [permission, requestPermission] = useCameraPermissions();
  const [languageId, setLanguageId] = useState<UiLanguageId>('ko');
  const [mode, setMode] = useState<UiRecognitionMode>('word');
  const [frame, setFrame] = useState<UiRecognitionFrame>(() => reader.getInitialFrame('ko', 'word'));
  const [selectedToken, setSelectedToken] = useState<UiRecognizedToken | null>(null);
  const [cameraSize, setCameraSize] = useState<CameraSize>({ width: 1, height: 1 });
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const language = useMemo(() => reader.getLanguage(languageId), [languageId, reader]);
  const languages = useMemo(() => reader.getLanguages(), [reader]);

  useEffect(() => {
    setSelectedToken(null);
    setFrame(reader.recognizeLiveFrame(languageId, mode, 0));
  }, [languageId, mode, reader]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((currentFrame) =>
        reader.recognizeLiveFrame(
          languageId,
          mode,
          Math.floor(currentFrame.capturedAt / 1200) + 1,
        ),
      );
    }, 1400);

    return () => clearInterval(timer);
  }, [languageId, mode, reader]);

  const handleCameraLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCameraSize({ width, height });
  };

  const handleTokenPress = (token: UiRecognizedToken) => {
    setSelectedToken(token);
    reader.speakToken(token, languageId);
  };

  const handleSpeakAll = () => {
    reader.speakFrame(frame.tokens, languageId);
  };

  const handlePickImage = async () => {
    setIsProcessingImage(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!result.canceled) {
        const nextFrame = await reader.recognizeStillImage(result.assets[0].uri, languageId, mode);
        setFrame(nextFrame);
        setSelectedToken(null);
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color="#0F766E" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <StatusBar style="dark" />
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={34} color="#0F766E" />
        </View>
        <Text style={styles.permissionTitle}>Camera access is needed</Text>
        <Text style={styles.permissionText}>
          Point the camera at text, then tap the recognized word or character to hear it.
        </Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Ionicons name="lock-open-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Allow camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView style={styles.camera} facing="back" onLayout={handleCameraLayout}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.appTitle}>Live Reader</Text>
              <Text style={styles.appSubtitle}>{mode === 'word' ? language.wordHint : language.characterHint}</Text>
            </View>
            <Pressable
              accessibilityLabel="Stop speech"
              style={styles.iconButton}
              onPress={reader.stopSpeech}
            >
              <Ionicons name="volume-mute-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.languageRow}>
            {languages.map((profile) => (
              <Pressable
                key={profile.id}
                style={[styles.languageButton, profile.id === languageId && styles.languageButtonActive]}
                onPress={() => setLanguageId(profile.id)}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    profile.id === languageId && styles.languageButtonTextActive,
                  ]}
                >
                  {profile.nativeName}
                </Text>
              </Pressable>
            ))}
          </View>

          <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            {frame.tokens.map((token) => (
              <Pressable
                key={token.id}
                style={[
                  styles.tokenBox,
                  selectedToken?.id === token.id && styles.tokenBoxActive,
                  {
                    left: token.bounds.x * cameraSize.width,
                    top: token.bounds.y * cameraSize.height,
                    width: token.bounds.width * cameraSize.width,
                    height: token.bounds.height * cameraSize.height,
                  },
                ]}
                onPress={() => handleTokenPress(token)}
              >
                <Text numberOfLines={1} adjustsFontSizeToFit style={styles.tokenText}>
                  {token.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.bottomPanel}>
            <View style={styles.modeRow}>
              <Pressable
                style={[styles.segmentButton, mode === 'word' && styles.segmentButtonActive]}
                onPress={() => setMode('word')}
              >
                <Text style={[styles.segmentText, mode === 'word' && styles.segmentTextActive]}>Words</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, mode === 'character' && styles.segmentButtonActive]}
                onPress={() => setMode('character')}
              >
                <Text style={[styles.segmentText, mode === 'character' && styles.segmentTextActive]}>
                  Characters
                </Text>
              </Pressable>
            </View>

            <View style={styles.resultRow}>
              <View style={styles.resultTextBlock}>
                <Text style={styles.resultLabel}>
                  {selectedToken ? `${language.label} selection` : 'Detected text'}
                </Text>
                <Text numberOfLines={2} style={styles.resultText}>
                  {selectedToken?.text ?? frame.tokens.map((token) => token.text).join(' ')}
                </Text>
                <Text numberOfLines={1} style={styles.resultMeta}>
                  {selectedToken?.reading ?? `${frame.tokens.length} tappable items`}
                </Text>
              </View>
              <Pressable accessibilityLabel="Speak detected text" style={styles.speakButton} onPress={handleSpeakAll}>
                <Ionicons name="volume-high-outline" size={22} color="#042F2E" />
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.secondaryButton} onPress={handlePickImage} disabled={isProcessingImage}>
                {isProcessingImage ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name="images-outline" size={18} color="#FFFFFF" />
                )}
                <Text style={styles.secondaryButtonText}>Import image</Text>
              </Pressable>
              <View style={styles.liveStatus}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>OCR provider: mock</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 28,
    backgroundColor: '#F8FAFC',
  },
  permissionIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: '#CCFBF1',
  },
  permissionTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: '#0F766E',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  appSubtitle: {
    maxWidth: 260,
    color: '#D1FAE5',
    fontSize: 13,
    marginTop: 3,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  languageButton: {
    minHeight: 34,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  languageButtonActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F8FAFC',
  },
  languageButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  languageButtonTextActive: {
    color: '#042F2E',
  },
  tokenBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: 'rgba(20, 184, 166, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(153, 246, 228, 0.86)',
  },
  tokenBoxActive: {
    backgroundColor: 'rgba(250, 204, 21, 0.42)',
    borderColor: '#FDE68A',
  },
  tokenText: {
    width: '100%',
    paddingHorizontal: 6,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomPanel: {
    gap: 14,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  modeRow: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
  },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  segmentButtonActive: {
    backgroundColor: '#ECFEFF',
  },
  segmentText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#155E75',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTextBlock: {
    flex: 1,
    minHeight: 70,
  },
  resultLabel: {
    color: '#99F6E4',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  resultMeta: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
  },
  speakButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#A7F3D0',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#0F766E',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 30,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
});
