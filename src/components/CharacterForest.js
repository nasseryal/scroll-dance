// ── Character Forest — Explorateur kawaii, tenue progressive aléatoire ─────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// ─── Palette néon pour les mutations ─────────────────────────────────────────
const NEON_PALETTE = [
  '#ff00ff', '#00ffff', '#ff0066', '#00ff88',
  '#cc00ff', '#ffff00', '#ff8800', '#ff3399',
  '#00ccff', '#aaff00',
];

// Pièces de tenue EXPLORATEUR :
// 0=feuilles, 1=yeux, 2=veste, 3=short, 4=bottes, 5=chemise, 6=ceinture
const BASE_FOREST_COLORS = {
  eye: '#8844ee',
  leaf: '#5acd35', leafDark: '#2d6a20', leafMid: '#3a9038',
  vest: '#2d6e2a', vestLight: '#3d9040', vestDark: '#1a4a18',
  short: '#1a4d20',
  boot: '#6b3210', bootLace: '#995522',
  shirt: '#c8a46a',
  belt: '#7a4820', buckle: '#cc9933',
};

const SKIN      = '#f5c9a0';
const SKIN_DARK = '#dba070';

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

function lightenHex(hex, f = 1.38) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.min(255, Math.floor(v * f)).toString(16).padStart(2, '0')).join('');
}

// Génère 10 tenues complètes (une par stade d'évolution)
function generateForestPlan() {
  return Array.from({ length: 10 }, () => {
    const colors = shuffleArray([...NEON_PALETTE]);
    return {
      leaf: colors[0], eye: colors[1], vest: colors[2],
      short: colors[3], boot: colors[4], shirt: colors[5], belt: colors[6],
    };
  });
}

function buildForestColors(evolutionStage, plan) {
  if (evolutionStage === 0 || !plan[evolutionStage - 1]) return { ...BASE_FOREST_COLORS };
  const s = plan[evolutionStage - 1];
  return {
    ...BASE_FOREST_COLORS,
    eye: s.eye,
    leaf: s.leaf, leafDark: darkenHex(s.leaf), leafMid: darkenHex(s.leaf, 0.72),
    vest: darkenHex(s.vest), vestLight: s.vest, vestDark: darkenHex(s.vest, 0.35),
    short: darkenHex(s.short),
    boot: darkenHex(s.boot, 0.6), bootLace: s.boot,
    shirt: lightenHex(s.shirt, 1.6),
    belt: darkenHex(s.belt), buckle: s.belt,
  };
}

// ─── Note musicale ────────────────────────────────────────────────────────────
function FloatNote({ color, startX }) {
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
      color, fontSize: 20, fontWeight: 'bold', opacity: op,
      transform: [{ translateY: ty }, { rotate: rotateDeg }],
      textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6,
    }}>
      {note}
    </Animated.Text>
  );
}

// ─── SVG du personnage ────────────────────────────────────────────────────────
function ForestSVG({ ouch, colors }) {
  const { eye, leaf, leafDark, leafMid, vest, vestLight, vestDark, short, boot, bootLace, shirt, belt, buckle } = colors;

  return (
    <Svg width={130} height={162} viewBox="0 0 100 130">

      {/* ══ BONNET DE FEUILLES ══ */}
      <Path d="M 20 48 Q 18 18 50 14 Q 82 18 80 48 Z" fill={leafDark} />
      <Rect x="20" y="45" width="60" height="8" rx="4" fill={leafMid} />
      <Ellipse cx="33" cy="32" rx="9"  ry="4.5" fill={leafDark} transform="rotate(-35,33,32)" />
      <Ellipse cx="50" cy="24" rx="10" ry="4.5" fill={leafDark} />
      <Ellipse cx="67" cy="32" rx="9"  ry="4.5" fill={leafDark} transform="rotate(35,67,32)" />
      <Ellipse cx="30" cy="38" rx="10" ry="5" fill={leaf} transform="rotate(-25,30,38)" />
      <Ellipse cx="44" cy="28" rx="10" ry="5" fill={leaf} transform="rotate(-10,44,28)" />
      <Ellipse cx="56" cy="28" rx="10" ry="5" fill={leaf} transform="rotate(10,56,28)" />
      <Ellipse cx="70" cy="38" rx="10" ry="5" fill={leaf} transform="rotate(25,70,38)" />
      <Path d="M 27 33 L 30 38" stroke={leafDark} strokeWidth="0.9" strokeLinecap="round" />
      <Path d="M 42 24 L 44 28" stroke={leafDark} strokeWidth="0.9" strokeLinecap="round" />
      <Path d="M 50 20 L 50 24" stroke={leafDark} strokeWidth="0.9" strokeLinecap="round" />
      <Path d="M 58 24 L 56 28" stroke={leafDark} strokeWidth="0.9" strokeLinecap="round" />
      <Path d="M 73 33 L 70 38" stroke={leafDark} strokeWidth="0.9" strokeLinecap="round" />

      {/* ══ OREILLES ══ */}
      <Circle cx="20" cy="54" r="7"   fill={SKIN} />
      <Circle cx="80" cy="54" r="7"   fill={SKIN} />
      <Circle cx="20" cy="54" r="4"   fill={SKIN_DARK} opacity="0.3" />
      <Circle cx="80" cy="54" r="4"   fill={SKIN_DARK} opacity="0.3" />

      {/* ══ TÊTE ══ */}
      <Circle cx="50" cy="54" r="30" fill={SKIN} />

      {/* ══ JOUES ══ */}
      <Ellipse cx="28" cy="62" rx="8" ry="5" fill="#ff9999" opacity="0.5" />
      <Ellipse cx="72" cy="62" rx="8" ry="5" fill="#ff9999" opacity="0.5" />

      {/* ══ YEUX ══ */}
      <Circle cx="38" cy="51" r="11" fill="white" />
      <Circle cx="62" cy="51" r="11" fill="white" />
      {ouch ? (
        <>
          <Path d="M 30 45 L 46 57 M 30 57 L 46 45" stroke={eye} strokeWidth="3" strokeLinecap="round" />
          <Path d="M 54 45 L 70 57 M 54 57 L 70 45" stroke={eye} strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="38" cy="51" r="8.5" fill={eye} />
          <Circle cx="62" cy="51" r="8.5" fill={eye} />
          <Circle cx="38" cy="51" r="5.5" fill="#150022" />
          <Circle cx="62" cy="51" r="5.5" fill="#150022" />
          <Circle cx="42" cy="47" r="3"   fill="white" />
          <Circle cx="66" cy="47" r="3"   fill="white" />
          <Circle cx="34" cy="55" r="1.5" fill="white" opacity="0.55" />
          <Circle cx="58" cy="55" r="1.5" fill="white" opacity="0.55" />
        </>
      )}

      {/* ══ NEZ ══ */}
      <Circle cx="50" cy="60" r="2.2" fill={SKIN_DARK} opacity="0.5" />

      {/* ══ BOUCHE ══ */}
      {ouch
        ? <Path d="M 43 68 Q 50 63 57 68" fill="none" stroke={SKIN_DARK} strokeWidth="1.6" strokeLinecap="round" />
        : <Path d="M 43 66 Q 50 73 57 66" fill="none" stroke={SKIN_DARK} strokeWidth="1.6" strokeLinecap="round" />
      }

      {/* ══ COU ══ */}
      <Rect x="43" y="82" width="14" height="6" fill={SKIN} />

      {/* ══ CORPS ══ */}
      <Path d="M 32 86 L 34 108 L 66 108 L 68 86 Q 60 82 50 82 Q 40 82 32 86 Z" fill={shirt} />
      <Path d="M 44 82 L 50 90 L 56 82" fill={SKIN} />
      <Path d="M 32 86 L 34 108 L 44 108 L 44 90 L 50 84 L 56 90 L 56 108 L 66 108 L 68 86 Q 60 82 50 82 Q 40 82 32 86 Z" fill={vest} />
      <Path d="M 44 82 L 42 108" stroke={vestLight} strokeWidth="1.2" />
      <Path d="M 56 82 L 58 108" stroke={vestLight} strokeWidth="1.2" />
      <Circle cx="50" cy="95"  r="1.4" fill={vestDark} />
      <Circle cx="50" cy="101" r="1.4" fill={vestDark} />
      <Rect x="57" y="90" width="9" height="7" rx="1.5" fill={vestDark} opacity="0.55" />

      {/* ══ CEINTURE ══ */}
      <Rect x="33" y="96" width="34" height="6" rx="2" fill={belt} />
      <Rect x="44" y="97" width="12" height="4" rx="1" fill={buckle} />
      <Rect x="47" y="97.5" width="6" height="3" rx="0.5" fill={belt} />

      {/* ══ BRAS ══ */}
      <Path d="M 32 88 Q 18 94 16 107 L 24 110 Q 26 98 34 94 Z" fill={vest} />
      <Path d="M 68 88 Q 82 94 84 107 L 76 110 Q 74 98 66 94 Z" fill={vest} />
      <Circle cx="19" cy="109" r="7" fill={SKIN} />
      <Circle cx="81" cy="109" r="7" fill={SKIN} />

      {/* ══ SHORT ══ */}
      <Rect x="33" y="107" width="14" height="10" rx="2" fill={short} />
      <Rect x="53" y="107" width="14" height="10" rx="2" fill={short} />

      {/* ══ BOTTES ══ */}
      <Path d="M 30 116 L 30 127 Q 30 130 34 130 L 49 130 Q 51 130 51 127 L 51 116 Z" fill={boot} />
      <Path d="M 51 116 L 51 127 Q 51 130 55 130 L 70 130 Q 72 130 72 127 L 72 116 Z" fill={boot} />
      <Path d="M 34 118 Q 40 116 46 118" fill="none" stroke={bootLace} strokeWidth="1" opacity="0.7" />
      <Path d="M 55 118 Q 61 116 67 118" fill="none" stroke={bootLace} strokeWidth="1" opacity="0.7" />
      <Path d="M 34 121 Q 40 119 46 121" fill="none" stroke={bootLace} strokeWidth="0.7" opacity="0.4" />
      <Path d="M 55 121 Q 61 119 67 121" fill="none" stroke={bootLace} strokeWidth="0.7" opacity="0.4" />
    </Svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CharacterForest({
  animLevel = 0, ouch = false, combo = 0,
  evolutionStage = 0, compressionRatio = 0,
}) {
  const [piecePlan] = useState(() => generateForestPlan());

  const ty  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  const ouchShake    = useRef(new Animated.Value(0)).current;
  const compressAnim = useRef(new Animated.Value(0)).current;

  const [notes, setNotes] = useState([]);
  const noteId = useRef(0);

  useEffect(() => {
    const idleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(ty, { toValue: -4, duration: 700, useNativeDriver: true }),
        Animated.timing(ty, { toValue:  0, duration: 700, useNativeDriver: true }),
      ])
    );
    idleAnim.start();
    return () => idleAnim.stop();
  }, []);

  useEffect(() => {
    if (animLevel === 0) return;
    const intensity = animLevel * 3;
    const dur = Math.max(180, 360 - animLevel * 40);
    const a = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -intensity,      duration: dur, useNativeDriver: true }),
          Animated.timing(rot, { toValue: intensity * 0.3, duration: dur, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ty,  { toValue: 0,                duration: dur, useNativeDriver: true }),
          Animated.timing(rot, { toValue: -intensity * 0.3, duration: dur, useNativeDriver: true }),
        ]),
      ])
    );
    a.start();
    return () => { a.stop(); rot.setValue(0); };
  }, [animLevel]);

  useEffect(() => {
    if (!ouch) return;
    Animated.sequence([
      Animated.timing(ouchShake, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   6, duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [ouch]);

  useEffect(() => {
    Animated.timing(compressAnim, {
      toValue: compressionRatio, duration: 120, useNativeDriver: true,
    }).start();
  }, [compressionRatio]);

  const scaleY    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const scaleX    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.20] });
  const rotateDeg = rot.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] });

  useEffect(() => {
    if (combo <= 0 || combo % 3 !== 0) return;
    const id = noteId.current++;
    const x = -20 + Math.random() * 50;
    setNotes(prev => [...prev, { id, x }]);
    setTimeout(() => setNotes(prev => prev.filter(n => n.id !== id)), 1000);
  }, [combo]);

  const colors = buildForestColors(evolutionStage, piecePlan);

  return (
    <View style={{ width: 140, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      {notes.map(n => (
        <FloatNote key={n.id} color={colors.leaf} startX={n.x + 30} />
      ))}

      <Animated.View style={{ transform: [{ scaleX }, { scaleY }] }}>
        <Animated.View style={{
          transform: [
            { translateY: ty },
            { rotate: rotateDeg },
            { translateX: ouchShake },
          ],
        }}>
          <ForestSVG ouch={ouch} colors={colors} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
