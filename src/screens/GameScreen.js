// ── Game Screen — SWIPE + disco bg + combo bar + wild streaks + 5 vies ────────
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Dimensions, StatusBar, PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ArrowButton, { ARROW_RENDER_SIZE } from '../components/ArrowButton';
import Character from '../components/Character';
import {
  DIRECTIONS, ARROW_COLORS, getIntervalForScore,
  getNextDirection, calcScore, getComboMessage, getSpeedLabel,
} from '../utils/gameLogic';
import { playGoodTap, playBadTap, playSpeedUp } from '../utils/sounds';

const { width, height } = Dimensions.get('window');
const MIN_SWIPE = 38;

function detectSwipe(dx, dy) {
  if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return null;
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up');
}

// ═══════════════════════════════════════════════════════
// CYBERPUNK GRID — fond noir, quadrillage violet statique
// ═══════════════════════════════════════════════════════
function CyberpunkGrid() {
  const STEP       = 38;   // espacement principal
  const ACCENT     = 4;    // toutes les N lignes = ligne accent plus lumineuse
  const COL_MAIN   = '#3a0060';  // violet sombre
  const COL_ACCENT = '#7700cc';  // violet accent
  const OP_MAIN    = 0.55;
  const OP_ACCENT  = 0.85;

  const hLines = [];
  const vLines = [];

  // Lignes horizontales
  let row = 0;
  for (let y = 0; y <= height; y += STEP) {
    const isAccent = row % ACCENT === 0;
    hLines.push(
      <View key={`h${y}`} style={{
        position: 'absolute', left: 0, top: y,
        width, height: isAccent ? 1.5 : 0.8,
        backgroundColor: isAccent ? COL_ACCENT : COL_MAIN,
        opacity: isAccent ? OP_ACCENT : OP_MAIN,
      }} />
    );
    row++;
  }

  // Lignes verticales
  let col = 0;
  for (let x = 0; x <= width; x += STEP) {
    const isAccent = col % ACCENT === 0;
    vLines.push(
      <View key={`v${x}`} style={{
        position: 'absolute', top: 0, left: x,
        width: isAccent ? 1.5 : 0.8, height,
        backgroundColor: isAccent ? COL_ACCENT : COL_MAIN,
        opacity: isAccent ? OP_ACCENT : OP_MAIN,
      }} />
    );
    col++;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hLines}
      {vLines}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// SCROLL STREAK — sauvage, fragmenté, électrique
// ═══════════════════════════════════════════════════════
function StreakFragment({ direction, color, angle, scale: scaleInit, delay, length, width: w }) {
  const op  = useRef(new Animated.Value(0)).current;
  const tx  = useRef(new Animated.Value(0)).current;
  const ty  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(scaleInit)).current;

  const isHoriz = direction === 'left' || direction === 'right';
  const sign    = direction === 'right' || direction === 'down' ? 1 : -1;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(op,  { toValue: 0.85, duration: 60,  useNativeDriver: true }),
        Animated.timing(rot, { toValue: angle * 0.3, duration: 320, useNativeDriver: true }),
        Animated.timing(sc,  { toValue: scaleInit * 1.3, duration: 320, useNativeDriver: true }),
        Animated.timing(
          isHoriz ? tx : ty,
          { toValue: sign * (40 + Math.random() * 40), duration: 320, useNativeDriver: true }
        ),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(op, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
      ]).start();
    }, delay);
  }, []);

  const fragW = isHoriz ? length : w;
  const fragH = isHoriz ? w     : length;

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: width / 2  - fragW / 2,
      top:  height / 2 - fragH / 2,
      width: fragW, height: fragH,
      borderRadius: Math.min(fragW, fragH) / 2,
      backgroundColor: color,
      opacity: op,
      transform: [
        { translateX: tx }, { translateY: ty },
        { rotate: rot.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] }) },
        { scale: sc },
      ],
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
    }} />
  );
}

// Étincelles autour du streak
function StreakSpark({ direction, color }) {
  const op = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;

  const sx = (Math.random() - 0.5) * width * 0.5;
  const sy = (Math.random() - 0.5) * height * 0.3;
  const sparkSize = 4 + Math.random() * 6;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(tx, { toValue: sx, duration: 380, useNativeDriver: true }),
      Animated.timing(ty, { toValue: sy, duration: 380, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(op, { toValue: 0.9, duration: 80,  useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: width / 2 - sparkSize / 2,
      top:  height / 2 - sparkSize / 2,
      width: sparkSize, height: sparkSize, borderRadius: sparkSize / 2,
      backgroundColor: color,
      opacity: op,
      transform: [{ translateX: tx }, { translateY: ty }],
    }} />
  );
}

function ScrollStreak({ direction, color }) {
  const RAINBOW = ['#00eeff', '#ff33cc', '#ffaa00', '#33ff88', '#cc44ff'];
  const isHoriz = direction === 'left' || direction === 'right';

  // Fragment principal + 4 fragments décalés angulaires + 8 étincelles
  const fragments = [
    { angle: 0,    scale: 1,    delay: 0,   length: isHoriz ? width * 0.8 : 50, w: isHoriz ? 36 : height * 0.5 },
    { angle: 12,   scale: 0.7,  delay: 30,  length: isHoriz ? width * 0.5 : 32, w: isHoriz ? 20 : height * 0.32 },
    { angle: -14,  scale: 0.65, delay: 50,  length: isHoriz ? width * 0.45 : 28, w: isHoriz ? 18 : height * 0.28 },
    { angle: 25,   scale: 0.45, delay: 10,  length: isHoriz ? width * 0.3 : 20, w: isHoriz ? 14 : height * 0.20 },
    { angle: -22,  scale: 0.4,  delay: 70,  length: isHoriz ? width * 0.28 : 18, w: isHoriz ? 12 : height * 0.18 },
  ];

  return (
    <>
      {fragments.map((f, i) => (
        <StreakFragment
          key={i} direction={direction}
          color={i === 0 ? color : RAINBOW[i % RAINBOW.length]}
          angle={f.angle} scale={f.scale} delay={f.delay}
          length={f.length} width={f.w}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <StreakSpark key={`sp${i}`} direction={direction} color={RAINBOW[i % RAINBOW.length]} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// COMBO BAR — grande, interactive, avec tiers
// ═══════════════════════════════════════════════════════
const COMBO_TIERS = [
  { minCombo: 20, label: '★ GOD MODE ★',  color: '#ff33cc' },
  { minCombo: 15, label: '⚡ INSANE ⚡',   color: '#aa33ff' },
  { minCombo: 10, label: '🔥 AMAZING',    color: '#ffaa00' },
  { minCombo:  5, label: '✦ GREAT',       color: '#00eeff' },
  { minCombo:  1, label: '· GOOD',        color: '#33ff88' },
];

function ComboBar({ combo }) {
  const BAR_W  = width * 0.86;
  const tier   = COMBO_TIERS.find(t => combo >= t.minCombo) || null;
  const nextTh = tier ? (COMBO_TIERS.find(t => t.minCombo > (tier.minCombo)) || { minCombo: tier.minCombo + 5 }).minCombo : 5;
  const prevTh = tier ? tier.minCombo : 0;
  const pct    = tier ? Math.min((combo - prevTh) / (nextTh - prevTh), 1) : Math.min(combo / 5, 1);

  const animW    = useRef(new Animated.Value(0)).current;
  const barGlow  = useRef(new Animated.Value(0)).current;
  const tierScale = useRef(new Animated.Value(1)).current;
  const prevTier  = useRef(null);

  useEffect(() => {
    Animated.spring(animW, { toValue: pct, friction: 7, tension: 80, useNativeDriver: false }).start();
    // Pulse sur chaque combo
    Animated.sequence([
      Animated.timing(barGlow, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(barGlow, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [combo]);

  useEffect(() => {
    if (tier && tier !== prevTier.current) {
      prevTier.current = tier;
      Animated.sequence([
        Animated.spring(tierScale, { toValue: 1.35, friction: 3, tension: 120, useNativeDriver: true }),
        Animated.spring(tierScale, { toValue: 1,    friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [tier?.minCombo]);

  const barColor = animW.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#00eeff', '#aa33ff', '#ff33cc', '#ffaa00'],
  });
  const glowShadow = barGlow.interpolate({ inputRange: [0, 1], outputRange: [2, 14] });
  const glowOp     = barGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 14, marginTop: 6 }}>
      {/* Tier label */}
      <View style={{ height: 22, justifyContent: 'center', marginBottom: 3 }}>
        {tier && (
          <Animated.Text style={{
            color: tier.color, fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold',
            letterSpacing: 2,
            textShadowColor: tier.color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
            transform: [{ scale: tierScale }],
          }}>
            {tier.label}
          </Animated.Text>
        )}
      </View>

      {/* Barre principale */}
      <Animated.View style={{
        width: BAR_W, shadowColor: tier?.color || '#00eeff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowOp,
        shadowRadius: glowShadow,
      }}>
        {/* Track */}
        <View style={{
          width: BAR_W, height: 14, borderRadius: 7,
          backgroundColor: '#150025',
          borderWidth: 1, borderColor: '#330044',
          overflow: 'hidden',
        }}>
          {/* Fill animé */}
          <Animated.View style={{
            height: '100%', borderRadius: 7,
            backgroundColor: barColor,
            width: animW.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_W] }),
          }} />
        </View>
      </Animated.View>

      {/* Combo counter */}
      {combo > 0 && (
        <Text style={{
          color: tier?.color || '#aa33ff', fontFamily: 'monospace',
          fontSize: 12, marginTop: 3, letterSpacing: 1,
          textShadowColor: tier?.color || '#aa33ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
        }}>
          COMBO  ×{combo}
        </Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════
// COMPOSANTS UI HELPER
// ═══════════════════════════════════════════════════════
function Particle({ color, startX, startY, angle, speed, sz }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(x,  { toValue: Math.cos(angle) * speed, duration: 560, useNativeDriver: true }),
      Animated.timing(y,  { toValue: Math.sin(angle) * speed, duration: 560, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 560, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: startX, top: startY,
      width: sz, height: sz, borderRadius: sz / 2,
      backgroundColor: color, opacity: op,
      transform: [{ translateX: x }, { translateY: y }],
    }} />
  );
}

function ParticlesBurst({ color, combo }) {
  const count  = Math.min(8 + combo * 2, 26);
  const sz     = combo >= 8 ? 10 : 6;
  const radius = 75 + combo * 10;
  const RAINBOW = ['#00eeff', '#ff33cc', '#ffaa00', '#33ff88', '#ff6600', '#cc44ff'];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i}
          color={combo >= 8 ? RAINBOW[i % RAINBOW.length] : color}
          startX={width / 2 - sz / 2} startY={height / 2 - sz / 2}
          angle={(i / count) * Math.PI * 2}
          speed={radius * (0.65 + Math.random() * 0.7)}
          sz={sz + Math.random() * 4}
        />
      ))}
    </>
  );
}

function ComboText({ text, color, size, isRainbow }) {
  const RAINBOW = ['#00eeff', '#ff33cc', '#ffaa00', '#33ff88', '#cc44ff', '#ff6600'];
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const las = useRef(text.split('').map(() => ({
    scale: new Animated.Value(0), ty: new Animated.Value(22),
  }))).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 100, useNativeDriver: true }),
      ...las.map((a, i) => Animated.sequence([
        Animated.delay(i * 55),
        Animated.parallel([
          Animated.spring(a.scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
          Animated.spring(a.ty,    { toValue: 0, friction: 4, tension: 100, useNativeDriver: true }),
        ]),
      ])),
    ]).start();
    setTimeout(() => Animated.parallel([
      Animated.timing(ty, { toValue: -65, duration: 600, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,   duration: 600, useNativeDriver: true }),
    ]).start(), 700);
  }, []);
  return (
    <Animated.View style={{ flexDirection: 'row', opacity: op, transform: [{ translateY: ty }], position: 'absolute', alignSelf: 'center' }}>
      {text.split('').map((ch, i) => {
        const c = isRainbow ? RAINBOW[i % RAINBOW.length] : color;
        return (
          <Animated.Text key={i} style={{
            color: c, fontSize: size, fontFamily: 'monospace', fontWeight: 'bold',
            textShadowColor: c, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
            transform: [{ scale: las[i].scale }, { translateY: las[i].ty }],
          }}>{ch}</Animated.Text>
        );
      })}
    </Animated.View>
  );
}

function MissText() {
  const scale = useRef(new Animated.Value(3.5)).current;
  const op    = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
      Animated.delay(280),
      Animated.timing(op, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.Text style={{
      position: 'absolute', alignSelf: 'center',
      color: '#ff3333', fontSize: 62, fontFamily: 'monospace', fontWeight: 'bold',
      textShadowColor: '#ff0000', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 24,
      transform: [{ scale }], opacity: op,
    }}>MISS!</Animated.Text>
  );
}

function Hearts({ lives }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{
          fontSize: 20, color: i < lives ? '#ff3366' : '#330022',
          textShadowColor: '#ff3366', textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: i < lives ? 8 : 0,
        }}>♥</Text>
      ))}
    </View>
  );
}

function SpeedTag({ label }) {
  const scale = useRef(new Animated.Value(0)).current;
  const op    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.2, friction: 4, tension: 120, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.Text style={{
      color: '#ffee00', fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', letterSpacing: 2,
      textShadowColor: '#ffee00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
      opacity: op, transform: [{ scale }],
    }}>{label}</Animated.Text>
  );
}

function ScreenFlash({ color, opacity: op }) {
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

function SwipeHint({ direction }) {
  if (!direction) return null;
  const color  = ARROW_COLORS[direction] || '#ffffff';
  const LABELS = { up: '↑ GLISSE', down: '↓ GLISSE', left: '← GLISSE', right: 'GLISSE →' };
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 1,   duration: 350, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.2, duration: 350, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [direction]);
  return (
    <Animated.Text style={{
      color, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', letterSpacing: 3,
      textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
      opacity: op,
    }}>{LABELS[direction]}</Animated.Text>
  );
}

// ═══════════════════════════════════════════════════════
// GAME SCREEN PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function GameScreen({ navigation }) {
  const [lives,        setLives]        = useState(5);
  const [score,        setScore]        = useState(0);
  const [combo,        setCombo]        = useState(0);
  const [activeDir,    setActiveDir]    = useState(null);
  const [charAnim,     setCharAnim]     = useState(0);
  const [ouch,         setOuch]         = useState(false);
  const [swipeDir,     setSwipeDir]     = useState(null);
  const [particles,    setParticles]    = useState([]);
  const [comboTexts,   setComboTexts]   = useState([]);
  const [streaks,      setStreaks]      = useState([]);
  const [showMiss,     setShowMiss]     = useState(false);
  const [speedTagText, setSpeedTagText] = useState(null);
  const [speedTagKey,  setSpeedTagKey]  = useState(0);

  const scoreScale    = useRef(new Animated.Value(1)).current;
  const flashOpacity  = useRef(new Animated.Value(0)).current;
  const flashColorRef = useRef('#00eeff');
  const badFlash      = useRef(new Animated.Value(0)).current;

  const livesRef     = useRef(5);
  const scoreRef     = useRef(0);
  const comboRef     = useRef(0);
  const activeDirRef = useRef(null);
  const intervalRef  = useRef(null);
  const lastSpeedLvl = useRef(0);
  const particleId   = useRef(0);
  const comboTextId  = useRef(0);
  const streakId     = useRef(0);
  const gameActive   = useRef(true);
  const swipeHandled = useRef(false);

  function bounceScore() {
    scoreScale.setValue(2.4);
    Animated.spring(scoreScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
  }

  function triggerFlash(color, duration = 120) {
    flashColorRef.current = color;
    flashOpacity.setValue(0.28);
    Animated.timing(flashOpacity, { toValue: 0, duration, useNativeDriver: true }).start();
  }

  const spawnArrow = useCallback(() => {
    const next = getNextDirection(activeDirRef.current);
    activeDirRef.current = next;
    setActiveDir(next);
    setSwipeDir(null);
    swipeHandled.current = false;
  }, []);

  function startTimer(currentScore) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = getIntervalForScore(currentScore);
    intervalRef.current = setInterval(() => {
      if (!gameActive.current) return;
      handleMiss();
    }, ms);
  }

  const handleMiss = useCallback(() => {
    if (!gameActive.current) return;
    clearInterval(intervalRef.current);
    playBadTap();
    triggerFlash('#ff0000', 240);
    badFlash.setValue(0.6);
    Animated.timing(badFlash, { toValue: 0, duration: 320, useNativeDriver: true }).start();
    setOuch(true);
    setTimeout(() => setOuch(false), 500);
    setShowMiss(true);
    setTimeout(() => setShowMiss(false), 750);
    comboRef.current = 0;
    setCombo(0);
    const newLives = livesRef.current - 1;
    livesRef.current = newLives;
    setLives(newLives);
    if (newLives <= 0) {
      gameActive.current = false;
      setTimeout(() => navigation.replace('GameOver', {
        score: scoreRef.current, combo: comboRef.current,
      }), 400);
      return;
    }
    spawnArrow();
    startTimer(scoreRef.current);
  }, [navigation, spawnArrow]);

  const handleGoodSwipe = useCallback((dir) => {
    clearInterval(intervalRef.current);
    if (!gameActive.current) return;
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setCombo(newCombo);
    const newScore = calcScore(scoreRef.current, newCombo);
    scoreRef.current = newScore;
    setScore(newScore);
    bounceScore();
    playGoodTap(newCombo);
    const color = ARROW_COLORS[dir] || '#00eeff';
    triggerFlash(color, 120);

    // Streak sauvage
    const sid = streakId.current++;
    setStreaks(prev => [...prev, { id: sid, direction: dir, color }]);
    setTimeout(() => setStreaks(prev => prev.filter(s => s.id !== sid)), 550);

    // Particules
    const pid = particleId.current++;
    setParticles(prev => [...prev, { id: pid, color, combo: newCombo }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 620);

    // Combo message
    const msg = getComboMessage(newCombo);
    if (msg) {
      const cid = comboTextId.current++;
      setComboTexts(prev => [...prev, { id: cid, ...msg }]);
      setTimeout(() => setComboTexts(prev => prev.filter(c => c.id !== cid)), 1500);
    }

    // Speed
    const newSpeedLvl = Math.floor(newScore / 50);
    if (newSpeedLvl > lastSpeedLvl.current) {
      lastSpeedLvl.current = newSpeedLvl;
      const label = getSpeedLabel(newScore);
      if (label) {
        playSpeedUp();
        setSpeedTagText(label);
        setSpeedTagKey(k => k + 1);
      }
    }

    setSwipeDir(dir);
    const lvl = newCombo >= 10 ? 4 : newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
    setCharAnim(lvl);
    setTimeout(() => { setCharAnim(0); setSwipeDir(null); }, 650);

    spawnArrow();
    startTimer(newScore);
  }, [spawnArrow]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8,
      onPanResponderRelease: (_, gs) => {
        if (!gameActive.current || swipeHandled.current) return;
        const dir = detectSwipe(gs.dx, gs.dy);
        if (!dir) return;
        swipeHandled.current = true;
        if (dir === activeDirRef.current) handleGoodSwipe(dir);
        else handleMiss();
      },
    })
  ).current;

  async function saveHighScore(s) {
    const stored = await AsyncStorage.getItem('highScore');
    if (!stored || s > parseInt(stored, 10))
      await AsyncStorage.setItem('highScore', String(s));
  }

  useEffect(() => {
    gameActive.current = true;
    spawnArrow();
    startTimer(0);
    return () => { gameActive.current = false; clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => { if (lives <= 0) saveHighScore(scoreRef.current); }, [lives]);

  // ── Positionnement des flèches — le wrapper SVG fait exactement ARROW_RENDER_SIZE
  const AS  = ARROW_RENDER_SIZE;   // 88px = taille réelle du SVG rendu
  const MAR = 10;                  // marge depuis bord écran

  // Zone de jeu utile (entre HUD et hint)
  const HUD_H  = 130;
  const BOT_H  = 75;
  const gameH  = height - HUD_H - BOT_H;
  const gameCX = width  / 2;
  const gameCY = HUD_H + gameH / 2;

  const arrowPos = {
    up:    { top: HUD_H + MAR,                  left: gameCX - AS / 2 },
    down:  { top: HUD_H + gameH - AS - MAR,     left: gameCX - AS / 2 },
    left:  { top: gameCY - AS / 2,              left: MAR },
    right: { top: gameCY - AS / 2,              left: width - AS - MAR },
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#06000f" />

      {/* Fond cyberpunk */}
      <CyberpunkGrid />

      {/* Flashes */}
      <ScreenFlash color={flashColorRef.current} opacity={flashOpacity} />
      <ScreenFlash color="#ff000099" opacity={badFlash} />

      {/* Streaks sauvages */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {streaks.map(s => <ScrollStreak key={s.id} direction={s.direction} color={s.color} />)}
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <Hearts lives={lives} />
        <View style={{ alignItems: 'flex-end' }}>
          <Animated.Text style={[styles.scoreText, { transform: [{ scale: scoreScale }] }]}>
            {String(score).padStart(4, '0')}
          </Animated.Text>
        </View>
      </View>

      {/* Barre combo */}
      <ComboBar combo={combo} />

      {/* Speed tag */}
      <View style={styles.speedArea}>
        {speedTagText && <SpeedTag key={speedTagKey} label={speedTagText} />}
      </View>

      {/* Flèches — positionnées pixel-perfect */}
      {DIRECTIONS.map(dir => (
        <View key={dir} style={[styles.arrowAbs, arrowPos[dir]]}>
          <ArrowButton direction={dir} isActive={activeDir === dir} size={AS} />
        </View>
      ))}

      {/* Personnage */}
      <View style={[styles.charWrapper, { top: gameCY - 88, left: gameCX - 60 }]} pointerEvents="none">
        <Character animLevel={charAnim} ouch={ouch} combo={combo} swipeDir={swipeDir} />
      </View>

      {/* Zone combo / MISS */}
      <View style={[styles.comboZone, { top: gameCY - 165 }]} pointerEvents="none">
        {showMiss && <MissText />}
        {comboTexts.map(ct => (
          <ComboText key={ct.id} text={ct.text} color={ct.color}
            size={ct.size} isRainbow={ct.color === 'rainbow'} />
        ))}
      </View>

      {/* Hint swipe */}
      <View style={styles.hintArea} pointerEvents="none">
        <SwipeHint direction={activeDir} />
      </View>

      {/* Particules */}
      {particles.map(p => <ParticlesBurst key={p.id} color={p.color} combo={p.combo} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#06000f' },
  hud: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 4,
  },
  scoreText: {
    color: '#ffee00', fontFamily: 'monospace', fontSize: 28, fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: '#ffee00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  speedArea:   { alignItems: 'center', height: 22, marginTop: 2 },
  arrowAbs:    { position: 'absolute' },
  charWrapper: { position: 'absolute' },
  comboZone:   { position: 'absolute', left: 0, right: 0, alignItems: 'center', height: 80 },
  hintArea:    { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
});
