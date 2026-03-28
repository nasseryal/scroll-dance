// ── Character — Kawaii K-pop, évolutif avec tenue progressive aléatoire ────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, {
  Circle, Ellipse, Path, Rect, Defs,
  RadialGradient, LinearGradient, Stop,
} from 'react-native-svg';

// ─── Palette néon pour les mutations de tenue ─────────────────────────────────
const NEON_PALETTE = [
  '#ff00ff', '#00ffff', '#ff0066', '#00ff88',
  '#cc00ff', '#ffff00', '#ff8800', '#ff3399',
  '#00ccff', '#aaff00',
];

// Pièces de tenue LE DEV : 0=corps, 1=jambes, 2=chaussures, 3=étoile
const BASE_COLORS = {
  body1: '#1177ff', body2: '#0044cc',
  legs: '#0033aa', shoes: '#00ccff', star: '#00eeff',
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function darkenHex(hex, f = 0.52) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.floor(v * f).toString(16).padStart(2, '0')).join('');
}

// Génère 10 tenues complètes (une par stade d'évolution)
function generateDevPlan() {
  return Array.from({ length: 10 }, () => {
    const colors = shuffleArray([...NEON_PALETTE]);
    return { body: colors[0], legs: colors[1], shoes: colors[2], star: colors[3] };
  });
}

function buildColors(evolutionStage, plan) {
  if (evolutionStage === 0 || !plan[evolutionStage - 1]) return { ...BASE_COLORS };
  const s = plan[evolutionStage - 1];
  return { body1: s.body, body2: darkenHex(s.body), legs: s.legs, shoes: s.shoes, star: s.star };
}

// ─── Note musicale flottante ──────────────────────────────────────────────────
function MusicalNote({ color = '#00eeff', startX = 0 }) {
  const ty  = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const notes = ['♪', '♫', '♩', '♬'];
  const note  = notes[Math.floor(Math.random() * notes.length)];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty,  { toValue: -80, duration: 950, useNativeDriver: true }),
      Animated.timing(op,  { toValue: 0,   duration: 950, useNativeDriver: true }),
      Animated.timing(rot, { toValue: 1,   duration: 950, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotateDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '25deg'] });

  return (
    <Animated.Text style={{
      position: 'absolute', top: -10, left: startX,
      color, fontSize: 22, fontWeight: 'bold', opacity: op,
      transform: [{ translateY: ty }, { rotate: rotateDeg }],
      textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6,
    }}>
      {note}
    </Animated.Text>
  );
}

// ─── Étoile de swipe ─────────────────────────────────────────────────────────
function SwipeStar({ color }) {
  const scale = useRef(new Animated.Value(0)).current;
  const op    = useRef(new Animated.Value(1)).current;
  const stars = ['★', '✦', '✧', '✸'];
  const star  = stars[Math.floor(Math.random() * stars.length)];
  const x = -30 + Math.random() * 60;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.4, friction: 3, tension: 100, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text style={{
      position: 'absolute', top: -40, left: x,
      color, fontSize: 28, opacity: op,
      transform: [{ scale }],
      textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
    }}>
      {star}
    </Animated.Text>
  );
}

// ─── SVG du personnage ────────────────────────────────────────────────────────
function CharacterSVG({ ouch = false, colors }) {
  const { body1, body2, legs, shoes, star } = colors;
  return (
    <Svg width={130} height={162} viewBox="0 0 110 160">
      <Defs>
        <RadialGradient id="headG" cx="38%" cy="30%" r="60%">
          <Stop offset="0%"   stopColor="#ffe5b0" />
          <Stop offset="60%"  stopColor="#ffd08a" />
          <Stop offset="100%" stopColor="#e8a060" />
        </RadialGradient>
        <LinearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor={body1} />
          <Stop offset="100%" stopColor={body2} />
        </LinearGradient>
        <LinearGradient id="hairG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#333333" />
          <Stop offset="100%" stopColor="#0a0a0a" />
        </LinearGradient>
        <LinearGradient id="armG" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%"   stopColor={body1} />
          <Stop offset="100%" stopColor={body2} />
        </LinearGradient>
        <RadialGradient id="irisG" cx="35%" cy="35%" r="60%">
          <Stop offset="0%"   stopColor="#6677ff" />
          <Stop offset="100%" stopColor="#2233bb" />
        </RadialGradient>
        <RadialGradient id="blushG" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#ff99aa" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#ff99aa" stopOpacity="0"   />
        </RadialGradient>
      </Defs>

      <Ellipse cx="55" cy="158" rx="22" ry="5" fill="#000" opacity={0.28} />
      <Ellipse cx="55" cy="130" rx="24" ry="26" fill="url(#bodyG)" />
      <Path
        d="M55 119 L57.5 126 L65 126 L59.2 130 L61 137 L55 133 L49 137 L50.8 130 L45 126 L52.5 126 Z"
        fill={star} opacity={0.9}
      />
      <Ellipse cx="28" cy="125" rx="8" ry="14" fill="url(#armG)" />
      <Circle  cx="26" cy="139" r="7" fill="#ffd08a" />
      <Ellipse cx="82" cy="125" rx="8" ry="14" fill="url(#armG)" />
      <Circle  cx="84" cy="139" r="7" fill="#ffd08a" />
      <Ellipse cx="43" cy="153" rx="10" ry="8" fill={legs} />
      <Ellipse cx="67" cy="153" rx="10" ry="8" fill={legs} />
      <Ellipse cx="41" cy="158" rx="11" ry="5" fill={shoes} />
      <Ellipse cx="69" cy="158" rx="11" ry="5" fill={shoes} />
      <Circle cx="55" cy="72" r="40" fill="url(#headG)" />
      <Rect x="47" y="107" width="16" height="12" rx="4" fill="#ffd08a" />
      <Path
        d="M 18 70 C 15 42, 26 20, 55 18 C 84 20, 95 42, 92 70
           C 88 57, 81 50, 78 54 C 74 41, 70 30, 55 28
           C 40 30, 36 41, 32 54 C 29 50, 22 57, 18 70 Z"
        fill="url(#hairG)"
      />
      <Path
        d="M 20 70 C 12 82, 10 98, 17 110 C 21 120, 27 124, 29 120
           C 23 112, 18 100, 22 86 C 24 78, 22 73, 20 70 Z"
        fill="url(#hairG)"
      />
      <Path
        d="M 90 70 C 98 82, 100 98, 93 110 C 89 120, 83 124, 81 120
           C 87 112, 92 100, 88 86 C 86 78, 88 73, 90 70 Z"
        fill="url(#hairG)"
      />
      <Path d="M 36 26 C 41 22, 56 20, 67 25" stroke="#555555" strokeWidth={3} fill="none" opacity={0.7} />
      <Ellipse cx="16" cy="74" rx="6" ry="8" fill="#ffd08a" />
      <Ellipse cx="16" cy="74" rx="3.5" ry="5" fill="#e8a060" opacity={0.5} />
      <Ellipse cx="94" cy="74" rx="6" ry="8" fill="#ffd08a" />
      <Ellipse cx="94" cy="74" rx="3.5" ry="5" fill="#e8a060" opacity={0.5} />
      <Ellipse cx="41" cy="72" rx="10" ry="12" fill="white" />
      <Circle  cx="41" cy="73" r="7.5" fill="url(#irisG)" />
      <Circle  cx="41" cy="73" r="4"   fill="#0a0a1a" />
      <Circle  cx="44" cy="69" r="2.5" fill="white" opacity={0.95} />
      <Circle  cx="38" cy="74" r="1.2" fill="white" opacity={0.5} />
      <Path d="M 31 66 C 33 62, 49 62, 51 66" stroke="#0a0a1a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 33 81 L 31 84" stroke="#0a0a1a" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M 50 81 L 52 84" stroke="#0a0a1a" strokeWidth={1.5} strokeLinecap="round" />
      <Ellipse cx="69" cy="72" rx="10" ry="12" fill="white" />
      <Circle  cx="69" cy="73" r="7.5" fill="url(#irisG)" />
      <Circle  cx="69" cy="73" r="4"   fill="#0a0a1a" />
      <Circle  cx="72" cy="69" r="2.5" fill="white" opacity={0.95} />
      <Circle  cx="66" cy="74" r="1.2" fill="white" opacity={0.5} />
      <Path d="M 59 66 C 61 62, 77 62, 79 66" stroke="#0a0a1a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 61 81 L 59 84" stroke="#0a0a1a" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M 78 81 L 80 84" stroke="#0a0a1a" strokeWidth={1.5} strokeLinecap="round" />
      <Ellipse cx="28" cy="84" rx="10" ry="6" fill="url(#blushG)" />
      <Ellipse cx="82" cy="84" rx="10" ry="6" fill="url(#blushG)" />
      {ouch
        ? <Path d="M 46 95 Q 55 89 64 95" stroke="#cc3333" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        : <Path d="M 46 91 Q 55 100 64 91" stroke="#cc4444" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      }
    </Svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Character({
  animLevel = 0, ouch = false, combo = 0, swipeDir = null,
  evolutionStage = 0, compressionRatio = 0,
}) {
  const [piecePlan] = useState(() => generateDevPlan());

  const ty        = useRef(new Animated.Value(0)).current;
  const rot       = useRef(new Animated.Value(0)).current;
  const sx        = useRef(new Animated.Value(1)).current;
  const sy        = useRef(new Animated.Value(1)).current;
  const ouchShake = useRef(new Animated.Value(0)).current;
  const lean      = useRef(new Animated.Value(0)).current;

  const compressAnim   = useRef(new Animated.Value(0)).current;
  const explosionScale = useRef(new Animated.Value(1)).current;
  const explosionFlash = useRef(new Animated.Value(0)).current;
  const prevStageRef   = useRef(0);

  const [notes,      setNotes]      = useState([]);
  const [swipeStars, setSwipeStars] = useState([]);
  const noteId  = useRef(0);
  const starId  = useRef(0);
  const idleRef = useRef(null);

  function startIdle() {
    idleRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -7,    duration: 750, useNativeDriver: true }),
          Animated.timing(rot, { toValue: -0.03, duration: 750, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ty,  { toValue: 0,    duration: 750, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0.03, duration: 750, useNativeDriver: true }),
        ]),
      ])
    );
    idleRef.current.start();
  }

  function stopIdle() {
    if (idleRef.current) idleRef.current.stop();
  }

  function playDance(level) {
    stopIdle();
    if (level === 1) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -22,  duration: 130, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0.18, duration: 130, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 1.15, duration: 130, useNativeDriver: true }),
          Animated.timing(sy,  { toValue: 1.15, duration: 130, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(ty,  { toValue: 0,     useNativeDriver: true }),
          Animated.spring(rot, { toValue: -0.18, useNativeDriver: true }),
          Animated.spring(sx,  { toValue: 1,     useNativeDriver: true }),
          Animated.spring(sy,  { toValue: 1,     useNativeDriver: true }),
        ]),
        Animated.spring(rot, { toValue: 0, useNativeDriver: true }),
      ]).start(() => startIdle());
    } else if (level === 2) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -28, duration: 180, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 6.28, duration: 360, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 1.22, duration: 180, useNativeDriver: true }),
          Animated.timing(sy,  { toValue: 1.22, duration: 180, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(ty, { toValue: 0, useNativeDriver: true }),
          Animated.spring(sx, { toValue: 1, useNativeDriver: true }),
          Animated.spring(sy, { toValue: 1, useNativeDriver: true }),
        ]),
      ]).start(() => { rot.setValue(0); startIdle(); });
    } else if (level === 3) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -32, duration: 140, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 1.35, duration: 140, useNativeDriver: true }),
          Animated.timing(sy,  { toValue: 0.78, duration: 140, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0.4,  duration: 140, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(ty,  { toValue: 0,    useNativeDriver: true }),
          Animated.spring(sx,  { toValue: 1,    useNativeDriver: true }),
          Animated.spring(sy,  { toValue: 1,    useNativeDriver: true }),
          Animated.spring(rot, { toValue: -0.4, useNativeDriver: true }),
        ]),
        Animated.spring(rot, { toValue: 0, useNativeDriver: true }),
      ]).start(() => startIdle());
    } else if (level === 4) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sy,  { toValue: 0.72, duration: 80, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 1.38, duration: 80, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ty,  { toValue: -42,  duration: 120, useNativeDriver: true }),
          Animated.timing(sy,  { toValue: 1.42, duration: 120, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 0.72, duration: 120, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 0.38, duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ty,  { toValue: 0,     duration: 100, useNativeDriver: true }),
          Animated.timing(sy,  { toValue: 0.76,  duration: 100, useNativeDriver: true }),
          Animated.timing(sx,  { toValue: 1.32,  duration: 100, useNativeDriver: true }),
          Animated.timing(rot, { toValue: -0.38, duration: 100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(sy,  { toValue: 1, useNativeDriver: true }),
          Animated.spring(sx,  { toValue: 1, useNativeDriver: true }),
          Animated.spring(rot, { toValue: 0, useNativeDriver: true }),
        ]),
      ]).start(() => startIdle());
    }
  }

  function playOuch() {
    stopIdle();
    Animated.sequence([
      Animated.timing(sx,        { toValue: 0.9,  duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: 1,    duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: -1,   duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: 1,    duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: -1,   duration: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(ouchShake, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.spring(sx, { toValue: 1, useNativeDriver: true }),
        Animated.spring(sy, { toValue: 1, useNativeDriver: true }),
      ]),
    ]).start(() => startIdle());
  }

  useEffect(() => {
    Animated.timing(compressAnim, {
      toValue: compressionRatio, duration: 150, useNativeDriver: true,
    }).start();
  }, [compressionRatio]);

  useEffect(() => {
    if (evolutionStage > prevStageRef.current) {
      prevStageRef.current = evolutionStage;
      stopIdle();
      Animated.sequence([
        Animated.parallel([
          Animated.timing(explosionScale, { toValue: 1.9, duration: 80,  useNativeDriver: true }),
          Animated.timing(explosionFlash, { toValue: 1,   duration: 80,  useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(explosionScale, { toValue: 0,   duration: 140, useNativeDriver: true }),
          Animated.timing(explosionFlash, { toValue: 0,   duration: 100, useNativeDriver: true }),
        ]),
        Animated.spring(explosionScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start(() => startIdle());
    }
  }, [evolutionStage]);

  useEffect(() => {
    if (swipeDir && !ouch) {
      const leanVal = swipeDir === 'right' ? 0.25 : swipeDir === 'left' ? -0.25 : 0;
      const leapVal = (swipeDir === 'up' || swipeDir === 'down') ? -15 : -8;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(lean, { toValue: leanVal, duration: 100, useNativeDriver: true }),
          Animated.timing(ty,   { toValue: leapVal, duration: 100, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(lean, { toValue: 0, friction: 5, useNativeDriver: true }),
          Animated.spring(ty,   { toValue: 0, friction: 5, useNativeDriver: true }),
        ]),
      ]).start();
      const sid   = starId.current++;
      const color = { up: '#00eeff', down: '#ff33cc', left: '#ffaa00', right: '#33ff88' }[swipeDir] || '#fff';
      setSwipeStars(prev => [...prev, { id: sid, color }]);
      setTimeout(() => setSwipeStars(prev => prev.filter(s => s.id !== sid)), 700);
    }
  }, [swipeDir]);

  useEffect(() => {
    if (ouch) { playOuch(); }
    else {
      if (animLevel === 0) startIdle();
      else playDance(animLevel);
    }
  }, [animLevel, ouch]);

  useEffect(() => {
    if (animLevel > 0 && !ouch) {
      const id = noteId.current++;
      const x  = -25 + Math.random() * 70;
      setNotes(prev => [...prev, { id, x }]);
      setTimeout(() => setNotes(prev => prev.filter(n => n.id !== id)), 1000);
    }
  }, [combo]);

  const ouchTx    = ouchShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-12, 0, 12] });
  const rotStr    = rot.interpolate({ inputRange: [-6.5, 6.5], outputRange: ['-372deg', '372deg'] });
  const leanStr   = lean.interpolate({ inputRange: [-0.5, 0.5], outputRange: ['-28deg', '28deg'] });
  const compressY = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.70] });
  const compressX = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });

  const colors = buildColors(evolutionStage, piecePlan);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 140, height: 190 }}>
      {swipeStars.map(s => <SwipeStar key={s.id} color={s.color} />)}
      {notes.map(n => <MusicalNote key={n.id} color={colors.body1} startX={n.x} />)}

      <Animated.View style={{
        transform: [{ scale: explosionScale }],
        alignItems: 'center', justifyContent: 'center', width: 140, height: 190,
      }}>
        <Animated.View style={{ transform: [{ scaleX: compressX }, { scaleY: compressY }] }}>
          <Animated.View style={{
            transform: [
              { translateY: ty },
              { translateX: ouchTx },
              { rotate: rotStr },
              { rotate: leanStr },
              { scaleX: sx },
              { scaleY: sy },
            ],
          }}>
            <CharacterSVG ouch={ouch} colors={colors} />
          </Animated.View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={{
          position: 'absolute', width: 140, height: 190,
          backgroundColor: colors.star,
          opacity: explosionFlash, borderRadius: 80,
        }} />
      </Animated.View>
    </View>
  );
}
