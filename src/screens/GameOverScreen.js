// ── Game Over Screen ─────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePlayerScore, getPlayerCountry } from '../utils/leaderboard';
import { getProfile } from '../utils/profile';
import CharacterSelector from '../components/CharacterSelector';

const { width, height } = Dimensions.get('window');

// ─── Black hole animation ─────────────────────────────────────────────────────
function BlackHole() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale,   { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        alignSelf: 'center',
        top: height * 0.35,
        width:  width * 1.4,
        height: width * 1.4,
        borderRadius: width * 0.7,
        backgroundColor: '#000000',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ─── Blinking GAME OVER text ──────────────────────────────────────────────────
function BlinkText({ children, style }) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.15, duration: 325, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,    duration: 325, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text style={[style, { opacity: blink }]}>
      {children}
    </Animated.Text>
  );
}

// ─── Elastic bounce in ───────────────────────────────────────────────────────
function BounceIn({ delay = 0, children, style }) {
  const scale = useRef(new Animated.Value(0)).current;
  const op    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.timing(op,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={[style, { opacity: op, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Pulsing button ──────────────────────────────────────────────────────────
function PulseButton({ onPress }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const shadowRadius  = glow.interpolate({ inputRange: [0, 1], outputRange: [5, 20] });

  return (
    <Animated.View
      style={{
        shadowColor: '#00eeff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity,
        shadowRadius,
        elevation: 12,
        borderRadius: 6,
        marginTop: 32,
      }}
    >
      <TouchableOpacity style={styles.retryBtn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.retryText}>▶  RETRY</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Falling character ───────────────────────────────────────────────────────
function FallingChar() {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 120, duration: 700, useNativeDriver: true }),
        Animated.timing(scale,      { toValue: 0.1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 700, useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  return (
    <Animated.Text
      style={{
        fontSize: 48,
        transform: [{ translateY }, { scale }],
        opacity,
        marginBottom: 8,
      }}
    >
      🕺
    </Animated.Text>
  );
}

// ─── Quadrillage cyberpunk ───────────────────────────────────────────────────
function CyberpunkGrid() {
  const STEP = 38, ACCENT = 4;
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

// ─── Main ────────────────────────────────────────────────────────────────────
const MAPS = [
  { id: 'void',  label: '◈  VIDE'  },
  { id: 'space', label: '🌌 ESPACE' },
  { id: 'city',  label: '🏙️ CITY'  },
];

export default function GameOverScreen({ navigation, route }) {
  function handleLeaderboard() { navigation.navigate('Leaderboard'); }
  const { score = 0, combo = 0, mapIndex: initialMap = 0, charIndex: initialChar = 0 } = route.params || {};
  const [highScore,   setHighScore]   = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [charIndex,   setCharIndex]   = useState(initialChar);
  const [mapIndex,    setMapIndex]    = useState(initialMap);

  useEffect(() => {
    const country = getPlayerCountry();
    AsyncStorage.getItem('highScore').then(val => {
      const hs = val ? parseInt(val, 10) : 0;
      setHighScore(Math.max(hs, score));
      setIsNewRecord(score > hs);
      if (score > hs) AsyncStorage.setItem('highScore', String(score));
    });
    getProfile().then(p => {
      savePlayerScore(score, country, p.gamertag || 'YOU');
    });
  }, []);

  function handleRetry() { navigation.replace('Game', { mapIndex, charIndex }); }
  function changeMap(dir) { setMapIndex(i => (i + dir + MAPS.length) % MAPS.length); }
  function handleHome()  { navigation.navigate('Home'); }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06000f" />
      <CyberpunkGrid />
      <BlackHole />

      <View style={styles.content}>
        <FallingChar />

        {/* GAME OVER */}
        <BlinkText style={styles.gameOverText}>GAME OVER</BlinkText>

        {/* Score */}
        <BounceIn delay={300}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{String(score).padStart(4, '0')}</Text>
          {isNewRecord && (
            <Text style={styles.newRecord}>★ NEW RECORD! ★</Text>
          )}
        </BounceIn>

        {/* Best combo */}
        <BounceIn delay={500}>
          <Text style={styles.comboText}>BEST COMBO : x{combo}</Text>
        </BounceIn>

        {/* High score */}
        <BounceIn delay={650}>
          <Text style={styles.highScoreText}>HIGH SCORE : {String(highScore).padStart(4, '0')}</Text>
        </BounceIn>

        {/* Sélecteur de map */}
        <BounceIn delay={750}>
          <View style={styles.mapSelector}>
            <TouchableOpacity onPress={() => changeMap(-1)} style={styles.mapArrow} activeOpacity={0.6}>
              <Text style={styles.mapArrowText}>◄</Text>
            </TouchableOpacity>
            <View style={styles.mapLabel}>
              <Text style={styles.mapLabelTitle}>MAP</Text>
              <Text style={styles.mapLabelName}>{MAPS[mapIndex].label}</Text>
              <View style={styles.mapDots}>
                {MAPS.map((_, i) => (
                  <View key={i} style={[styles.dot, i === mapIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={() => changeMap(1)} style={styles.mapArrow} activeOpacity={0.6}>
              <Text style={styles.mapArrowText}>►</Text>
            </TouchableOpacity>
          </View>
        </BounceIn>

        {/* Sélecteur de personnage */}
        <BounceIn delay={800}>
          <CharacterSelector charIndex={charIndex} onChange={setCharIndex} />
        </BounceIn>

        {/* Retry button */}
        <BounceIn delay={950}>
          <PulseButton onPress={handleRetry} />
        </BounceIn>

        {/* Home button */}
        <BounceIn delay={1050}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleHome}
            activeOpacity={0.7}
          >
            <Text style={styles.homeBtnText}>⌂  MENU</Text>
          </TouchableOpacity>
        </BounceIn>

        {/* Leaderboard button */}
        <BounceIn delay={1200}>
          <TouchableOpacity
            style={styles.lbBtn}
            onPress={handleLeaderboard}
            activeOpacity={0.7}
          >
            <Text style={styles.lbBtnText}>🏆 CLASSEMENT</Text>
          </TouchableOpacity>
        </BounceIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06000f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 24,
  },
  gameOverText: {
    color: '#ff33cc',
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    textShadowColor: '#ff33cc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 24,
  },
  scoreLabel: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 4,
    textAlign: 'center',
  },
  scoreValue: {
    color: '#ffee00',
    fontFamily: 'monospace',
    fontSize: 52,
    fontWeight: 'bold',
    letterSpacing: 6,
    textAlign: 'center',
    textShadowColor: '#ffee00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  newRecord: {
    color: '#ff33cc',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 4,
    textShadowColor: '#ff33cc',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  comboText: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 16,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 16,
    textShadowColor: '#aa33ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  highScoreText: {
    color: '#33ff88',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
  },
  retryBtn: {
    borderWidth: 3,
    borderColor: '#00eeff',
    borderRadius: 6,
    paddingHorizontal: 52,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  homeBtn: {
    marginTop: 14,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#33ff88',
    borderRadius: 6,
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#33ff88',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 3,
  },
  lbBtn: {
    marginTop: 14,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#aa33ff',
    borderRadius: 6,
    alignItems: 'center',
  },
  lbBtnText: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 3,
  },
  mapSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#330055',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(10, 0, 30, 0.55)',
  },
  mapArrow: { paddingHorizontal: 14, paddingVertical: 4 },
  mapArrowText: { color: '#aa33ff', fontFamily: 'monospace', fontSize: 16 },
  mapLabel: { alignItems: 'center', minWidth: 110 },
  mapLabelTitle: { color: '#440077', fontFamily: 'monospace', fontSize: 9, letterSpacing: 4, marginBottom: 2 },
  mapLabelName:  { color: '#cc88ff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, fontWeight: 'bold' },
  mapDots: { flexDirection: 'row', marginTop: 5, gap: 6 },
  dot:       { width: 5, height: 5, borderRadius: 3, backgroundColor: '#330055' },
  dotActive: { backgroundColor: '#aa33ff', shadowColor: '#aa33ff', shadowOpacity: 1, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  retryText: {
    color: '#00eeff',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: '#00eeff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
