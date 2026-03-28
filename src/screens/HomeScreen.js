// ── Home Screen ──────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Character from '../components/Character';
import CharacterForest from '../components/CharacterForest';
import CharacterAstronaut from '../components/CharacterAstronaut';
import CharacterCity from '../components/CharacterCity';
import CharacterDisco from '../components/CharacterDisco';
import EmptyCharacter from '../components/EmptyCharacter';
import CharacterSelector, { CHAR_UNLOCKS, CHARACTERS } from '../components/CharacterSelector';
import SpaceBackgroundAnimation from '../components/SpaceMenuAnimation';
import VoidBackground from '../components/VoidBackground';
import CityBackground from '../components/CityBackground';
import JungleBackground from '../components/JungleBackground';
import DiscoBackground from '../components/DiscoBackground';

const MAPS = [
  { id: 'disco',   label: '🪩 DISCO'   },
  { id: 'jungle',  label: '🌿 JUNGLE'  },
  { id: 'city',    label: '🏙️ CITY'   },
  { id: 'space',   label: '🌌 ESPACE'  },
  { id: 'void',    label: '⬡  BIENTÔT' },
];

// Score requis pour débloquer chaque map
const MAP_UNLOCKS = [0, 1000, 2000, 3000, Infinity];

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [highScore, setHighScore] = useState(0);
  const [mapIndex,  setMapIndex]  = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Title blink
  const blink = useRef(new Animated.Value(1)).current;
  // Button glow pulse
  const btnGlow = useRef(new Animated.Value(0)).current;
  // Subtitle float
  const subFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('highScore').then(val => {
      if (val) setHighScore(parseInt(val, 10));
    });

    // Blink title
    const blinkAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.delay(800),
      ])
    );
    blinkAnim.start();

    // Button glow pulse
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(btnGlow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    glowAnim.start();

    // Subtitle float
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(subFloat, { toValue: -5, duration: 1400, useNativeDriver: true }),
        Animated.timing(subFloat, { toValue:  5, duration: 1400, useNativeDriver: true }),
      ])
    );
    floatAnim.start();

    return () => { blinkAnim.stop(); glowAnim.stop(); floatAnim.stop(); };
  }, []);

  const btnShadowOpacity = btnGlow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const btnShadowRadius  = btnGlow.interpolate({ inputRange: [0, 1], outputRange: [6, 18] });

  function changeMap(dir) {
    setMapIndex(i => (i + dir + MAPS.length) % MAPS.length);
  }

  function handleCharChange(next) {
    setCharIndex(next);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050214" />

      {/* Fond selon la map sélectionnée */}
      {highScore >= MAP_UNLOCKS[mapIndex]
        ? (mapIndex === 0 ? <DiscoBackground /> : mapIndex === 1 ? <JungleBackground /> : mapIndex === 2 ? <CityBackground /> : mapIndex === 3 ? <SpaceBackgroundAnimation /> : <VoidBackground />)
        : null}

      {/* UI par-dessus */}
      <View style={styles.uiContainer}>
        {/* Bouton profil */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>

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
            ♪ SCROLL THE BEAT ♪
          </Animated.Text>
        </View>

        {/* Character preview */}
        <View style={styles.charWrapper}>
          {highScore < CHAR_UNLOCKS[charIndex] ? (
            <View style={styles.mysteryChar}>
              <Text style={styles.mysteryText}>🔒</Text>
            </View>
          ) : charIndex === 0
            ? <CharacterDisco animLevel={0} ouch={false} combo={0} />
            : charIndex === 1
            ? <CharacterForest animLevel={0} ouch={false} combo={0} />
            : charIndex === 2
            ? <CharacterCity animLevel={0} ouch={false} combo={0} />
            : charIndex === 3
            ? <CharacterAstronaut animLevel={0} ouch={false} combo={0} />
            : null
          }
        </View>

        {/* Sélecteur de personnage */}
        <CharacterSelector charIndex={charIndex} onChange={handleCharChange} highScore={highScore} />

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
            onPress={() => navigation.navigate('Game', { mapIndex, charIndex })}
            activeOpacity={0.8}
          >
            <Text style={styles.playBtnText}>▶  PLAY</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Leaderboard button */}
        <TouchableOpacity
          style={styles.lbBtn}
          onPress={() => navigation.navigate('Leaderboard')}
          activeOpacity={0.7}
        >
          <Text style={styles.lbBtnText}>🏆 CLASSEMENT</Text>
        </TouchableOpacity>

        {/* Sélecteur de map */}
        <View style={styles.mapSelector}>
          <TouchableOpacity onPress={() => changeMap(-1)} style={styles.mapArrow} activeOpacity={0.6}>
            <Text style={styles.mapArrowText}>◄</Text>
          </TouchableOpacity>

          <View style={styles.mapLabel}>
            <Text style={styles.mapLabelTitle}>MAP</Text>
            {highScore < MAP_UNLOCKS[mapIndex] ? (
              <Text style={{ fontSize: 22 }}>🔒</Text>
            ) : (
              <Text style={styles.mapLabelName}>{MAPS[mapIndex].label}</Text>
            )}
            <View style={styles.mapDots}>
              {MAPS.map((_, i) => (
                <View key={i} style={[
                  styles.dot,
                  i === mapIndex && styles.dotActive,
                  highScore < MAP_UNLOCKS[i] && styles.dotLocked,
                ]} />
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => changeMap(1)} style={styles.mapArrow} activeOpacity={0.6}>
            <Text style={styles.mapArrowText}>►</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>← ↑ ↓ →  4 DIRECTIONS  ← ↑ ↓ →</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050214',
  },
  uiContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  profileBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aa33ff',
    backgroundColor: 'rgba(10, 0, 30, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontSize: 18,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  mysteryChar: {
    width: 140,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#330055',
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(10, 0, 30, 0.4)',
  },
  mysteryText: {
    color: '#550088',
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 6,
    textShadowColor: '#550088',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  mysteryScore: {
    color: '#440066',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 8,
  },
  lockedWrapper: {
    position: 'relative',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 2, 20, 0.62)',
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 28,
  },
  lockLabel: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4,
    textShadowColor: '#aa33ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  lockSecret: {
    color: '#440077',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 4,
    fontWeight: 'bold',
    marginTop: 2,
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
  lbBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#aa33ff',
    borderRadius: 6,
  },
  lbBtnText: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 3,
  },
  mapSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#330055',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(10, 0, 30, 0.55)',
  },
  mapArrow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  mapArrowText: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  mapLabel: {
    alignItems: 'center',
    minWidth: 120,
  },
  mapLabelTitle: {
    color: '#440077',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 2,
  },
  mapLabelName: {
    color: '#cc88ff',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  mapDots: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#330055',
  },
  dotActive: {
    backgroundColor: '#aa33ff',
    shadowColor: '#aa33ff',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  dotLocked: {
    backgroundColor: '#1a0a2a',
    borderWidth: 1,
    borderColor: '#330055',
  },
  mapLockScore: {
    color: '#550088',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
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
