import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LiveReaderScreen } from './src/ui/screens/LiveReaderScreen';
import { TutorConversationScreen } from './src/ui/screens/TutorConversationScreen';

type AppScreen = 'tutor' | 'camera';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('tutor');

  if (screen === 'camera') {
    return (
      <View style={styles.root}>
        <LiveReaderScreen />
        <Pressable style={styles.backButton} onPress={() => setScreen('tutor')}>
          <Text style={styles.backButtonText}>Tutor</Text>
        </Pressable>
      </View>
    );
  }

  return <TutorConversationScreen onOpenCamera={() => setScreen('camera')} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    right: 14,
    top: 58,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
  backButtonText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
});
