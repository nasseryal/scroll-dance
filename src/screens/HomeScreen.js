// ── Home Screen ──────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Character from '../components/Character';

const { width, height } = Dimensions.get('window');

// Quadrillage cyberpunk violet
function CyberpunkGrid() {
  const STEP = 38;
  const ACCENT = 4;
  const lines = [];
  let row = 0;
  for (let y = 0; y <= height; y += STEP) {
    const a = row % ACCENT === 0;
    lines.push(<View key={`h${y}`} style={{
      position: 'absolute', left: 0, top: y, width, height: a ? 1.5 : 0.8,
      backgroundColor: a ? '#7700cc' : '#3a0060', opacity: a ? 0.85 : 0.55,
    }} />);
    row++;
  }
  let col = 0;
  for (let x = 0; x <= width; x += STEP) {
    const a = col % ACCENT === 0;
    lines.push(<View key={`v${x}`} style={{
      position: 'absolute', top: 0, left: x, width: a ? 1.5 : 0.8, height,
      backgroundColor: a ? '#7700cc' : '#3a0060', opacity: a ? 0.85 : 0.55,
    }} />);
    col++;
  }
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{lines}</View>;
}

export default function HomeScreen({ navigation }) {
  const [highScore, setHighScore] = useState(0);

  // Title blink
  const blink = useRef(new Animated.Value(1)).current;
  // Button glow pulse
  const btnGlow = useRef(new Animated.Value(0)).current;
  // Subtitle float
  const subFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load high score
    AsyncStorage.getItem('highScore').then(val => {
      if (val) setHighScore(parseInt(val, 10));
    });

    // Blink title
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.delay(800),
      ])
    ).start();

    // Button glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(btnGlow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Subtitle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(subFloat, { toValue: -5, duration: 1400, useNativeDriver: true }),
        Animated.timing(subFloat, { toValue:  5, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const btnShadowOpacity = btnGlow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const btnShadowRadius  = btnGlow.interpolate({ inputRange: [0, 1], outputRange: [6, 18] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06000f" />
      <CyberpunkGrid />

      {/* High score */}
      {highScore > 0 && (
        <View style={styles.highScoreRow}>
          <Text style={styles.highScoreLabel}>BEST</Text>
          <Text style={styles.highScoreValue}>{String(highScore).padStart(4, '0')}</Text>
        </View>
      )}

      {/* Title */}
      <View style={styles.titleBlock}>
        <Animated.Text style={[styles.titleLine1, { opacity: blink }]}>
          SCROLL
        </Animated.Text>
        <Animated.Text style={[styles.titleLine2, { opacity: blink }]}>
          DANCE
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { transform: [{ translateY: subFloat }] }]}>
          ♪ TAP THE BEAT ♪
        </Animated.Text>
      </View>

      {/* Character */}
      <View style={styles.charWrapper}>
        <Character animLevel={0} ouch={false} combo={0} />
      </View>

      {/* Play button */}
      <Animated.View
        style={[
          styles.btnShadowWrapper,
          {
            shadowOpacity: btnShadowOpacity,
            shadowRadius: btnShadowRadius,
            elevation: 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.8}
        >
          <Text style={styles.playBtnText}>▶  PLAY</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>← ↑ ↓ →  4 DIRECTIONS  ← ↑ ↓ →</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06000f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  highScoreRow: {
    position: 'absolute',
    top: 52,
    right: 24,
    alignItems: 'flex-end',
  },
  highScoreLabel: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 3,
  },
  highScoreValue: {
    color: '#ffee00',
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleLine1: {
    color: '#ff33cc',
    fontFamily: 'monospace',
    fontSize: 46,
    fontWeight: 'bold',
    letterSpacing: 8,
    textShadowColor: '#ff33cc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  titleLine2: {
    color: '#ff33cc',
    fontFamily: 'monospace',
    fontSize: 46,
    fontWeight: 'bold',
    letterSpacing: 12,
    marginTop: -8,
    textShadowColor: '#ff33cc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subtitle: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 3,
    marginTop: 10,
  },
  charWrapper: {
    marginVertical: 20,
  },
  btnShadowWrapper: {
    shadowColor: '#00eeff',
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 6,
    marginTop: 10,
  },
  playBtn: {
    borderWidth: 2,
    borderColor: '#00eeff',
    borderRadius: 6,
    paddingHorizontal: 52,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  playBtnText: {
    color: '#00eeff',
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: '#00eeff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    color: '#330055',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
  },
});
