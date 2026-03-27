// ── Character Astronaut — Chibi NASA, tenue progressive + accessoires ──────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// ─── Palette néon pour mutations ─────────────────────────────────────────────
const NEON_PALETTE = [
  '#ff00ff', '#00ffff', '#ff0066', '#00ff88',
  '#cc00ff', '#ffff00', '#ff8800', '#ff3399',
  '#00ccff', '#aaff00',
];

// Pièces : 0=combinaison, 1=visor, 2=gants, 3=bottes, 4=accent, 5=panneau, 6=anneau/épaules
const BASE_ASTRO = {
  suit:      '#e85000',  // orange NASA
  suitDark:  '#a03500',
  suitLight: '#ff7733',
  visor:     '#3366aa',  // bleu reflectif
  glove:     '#cc4400',
  boot:      '#7a2800',
  accent:    '#ffffff',
  panel:     '#222222',
  ring:      '#bbbbbb',
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

function lightenHex(hex, f = 1.38) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.min(255, Math.floor(v * f)).toString(16).padStart(2, '0')).join('');
}

function generateAstroPlan() {
  const colors = shuffleArray([...NEON_PALETTE]);
  const pieces = [
    ...shuffleArray([0, 1, 2, 3, 4, 5, 6]),
    ...shuffleArray([0, 1, 2]),
  ];
  return colors.map((color, i) => ({ piece: pieces[i], color }));
}

function buildAstroColors(evolutionStage, plan) {
  const c = { ...BASE_ASTRO };
  for (let i = 0; i < Math.min(evolutionStage, plan.length); i++) {
    const { piece, color } = plan[i];
    if (piece === 0) { c.suit = color; c.suitDark = darkenHex(color); c.suitLight = lightenHex(color); }
    else if (piece === 1) { c.visor = color; }
    else if (piece === 2) { c.glove = color; }
    else if (piece === 3) { c.boot = darkenHex(color, 0.65); }
    else if (piece === 4) { c.accent = color; }
    else if (piece === 5) { c.panel = darkenHex(color, 0.38); }
    else if (piece === 6) { c.ring = color; }
  }
  return c;
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
function AstronautSVG({ ouch, colors, evolutionStage }) {
  const { suit, suitDark, suitLight, visor, glove, boot, accent, panel, ring } = colors;

  const showDrone = evolutionStage >= 8;
  const showStaff = evolutionStage >= 9;
  const showCrown = evolutionStage >= 10;

  return (
    <Svg width={130} height={162} viewBox="0 0 100 130">

      {/* ══ STAGE 10 : COURONNE HOLOGRAPHIQUE ══ */}
      {showCrown && (
        <>
          <Ellipse cx="32" cy="16" rx="4" ry="13" fill="#aa00ff" opacity="0.88" transform="rotate(-28,32,26)" />
          <Ellipse cx="41" cy="10" rx="4" ry="15" fill="#00ffff" opacity="0.88" transform="rotate(-14,41,22)" />
          <Ellipse cx="50" cy="8"  rx="4.5" ry="16" fill="#ff00ff" opacity="0.88" />
          <Ellipse cx="59" cy="10" rx="4" ry="15" fill="#aaff00" opacity="0.88" transform="rotate(14,59,22)" />
          <Ellipse cx="68" cy="16" rx="4" ry="13" fill="#ff8800" opacity="0.88" transform="rotate(28,68,26)" />
          {/* Base couronne */}
          <Ellipse cx="50" cy="20" rx="19" ry="4" fill={accent} opacity="0.35" />
        </>
      )}

      {/* ══ STAGE 8+ : DRONE ══ */}
      {showDrone && (
        <>
          {/* Bras du drone */}
          <Path d="M 79 18 L 74 14" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 91 18 L 96 14" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 79 26 L 74 30" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M 91 26 L 96 30" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
          {/* Corps drone */}
          <Rect x="78" y="17" width="14" height="10" rx="3" fill="#2a2a2a" />
          <Rect x="80" y="19" width="10" height="6" rx="2" fill="#3a3a3a" />
          {/* Hélices */}
          <Ellipse cx="74" cy="13" rx="5" ry="1.8" fill={ring} opacity="0.75" />
          <Ellipse cx="96" cy="13" rx="5" ry="1.8" fill={ring} opacity="0.75" />
          <Ellipse cx="74" cy="31" rx="5" ry="1.8" fill={ring} opacity="0.75" />
          <Ellipse cx="96" cy="31" rx="5" ry="1.8" fill={ring} opacity="0.75" />
          {/* Caméra */}
          <Circle cx="85" cy="28" r="2.5" fill={visor} />
          <Circle cx="85" cy="28" r="1.2" fill="#111" />
          {/* LED */}
          <Circle cx="81" cy="20" r="1.2" fill={accent} opacity="0.9" />
          <Circle cx="89" cy="20" r="1.2" fill="#ff3333" opacity="0.9" />
          {/* Fil */}
          <Path d="M 85 27 Q 80 55 76 80" stroke={ring} strokeWidth="0.8" fill="none" strokeDasharray="3,2" opacity="0.6" />
        </>
      )}

      {/* ══ STAGE 9+ : STAFF + SERPENT ══ */}
      {showStaff && (
        <>
          {/* Staff */}
          <Path d="M 7 125 L 7 14" stroke={ring} strokeWidth="3" strokeLinecap="round" />
          <Path d="M 6 14 L 8 14" stroke={suitLight} strokeWidth="1.5" />
          {/* Orbe cristal */}
          <Circle cx="7" cy="10" r="7" fill={accent} opacity="0.3" />
          <Circle cx="7" cy="10" r="5.5" fill={visor} opacity="0.85" />
          <Circle cx="7" cy="10" r="3.5" fill={accent} opacity="0.9" />
          <Circle cx="5.5" cy="8" r="1.8" fill="white" opacity="0.7" />
          {/* Serpent — S-curve autour du staff */}
          <Path d="M 7 118 Q 18 106 7 92 Q -4 78 7 64 Q 18 50 7 36"
                stroke="#2a6e2a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <Path d="M 7 118 Q 16 108 7 96 Q -2 84 7 70 Q 16 56 7 42"
                stroke="#3d9040" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Écailles */}
          <Path d="M 7 105 Q 12 102 7 99" stroke="#1a5a1a" strokeWidth="1.2" fill="none" />
          <Path d="M 7 90 Q 2 87 7 84"   stroke="#1a5a1a" strokeWidth="1.2" fill="none" />
          <Path d="M 7 75 Q 12 72 7 69"  stroke="#1a5a1a" strokeWidth="1.2" fill="none" />
          <Path d="M 7 60 Q 2 57 7 54"   stroke="#1a5a1a" strokeWidth="1.2" fill="none" />
          {/* Tête serpent */}
          <Ellipse cx="8" cy="34" rx="5.5" ry="4" fill="#2a6e2a" transform="rotate(-15, 8, 34)" />
          <Circle cx="10" cy="32" r="1.2" fill="#ffff00" />
          <Circle cx="10" cy="32" r="0.6" fill="#111" />
          {/* Langue */}
          <Path d="M 5 31 Q 2 28 1 26 M 2 28 Q 0 26 -1 24" stroke="#ff2222" strokeWidth="0.9" strokeLinecap="round" />
        </>
      )}

      {/* ══ JAMBES ══ */}
      <Rect x="32" y="104" width="15" height="12" rx="4" fill={suit} />
      <Rect x="53" y="104" width="15" height="12" rx="4" fill={suit} />

      {/* ══ BOTTES ══ */}
      <Path d="M 28 114 L 28 124 Q 28 128 33 128 L 49 128 Q 51 128 51 124 L 51 114 Z" fill={boot} />
      <Path d="M 50 114 L 50 124 Q 50 128 55 128 L 71 128 Q 73 128 73 124 L 73 114 Z" fill={boot} />
      {/* Semelle */}
      <Ellipse cx="39" cy="127" rx="13" ry="3" fill={suitDark} opacity="0.6" />
      <Ellipse cx="62" cy="127" rx="13" ry="3" fill={suitDark} opacity="0.6" />

      {/* ══ CORPS ══ */}
      <Path d="M 22 80 Q 19 105 22 106 L 78 106 Q 81 105 78 80 Q 65 73 50 73 Q 35 73 22 80 Z" fill={suit} />

      {/* Détails corps — poches latérales */}
      <Rect x="21" y="90" width="8" height="12" rx="2" fill={suitDark} opacity="0.5" />
      <Rect x="71" y="90" width="8" height="12" rx="2" fill={suitDark} opacity="0.5" />

      {/* Épaules / protection */}
      <Ellipse cx="21" cy="83" rx="12" ry="9" fill={suitLight} />
      <Ellipse cx="79" cy="83" rx="12" ry="9" fill={suitLight} />
      <Ellipse cx="21" cy="83" rx="8"  ry="6" fill={suit} />
      <Ellipse cx="79" cy="83" rx="8"  ry="6" fill={suit} />

      {/* Panneau de contrôle thoracique */}
      <Rect x="35" y="83" width="30" height="18" rx="3" fill={panel} />
      {/* Boutons */}
      <Circle cx="42" cy="89" r="2.8" fill={accent} opacity="0.9" />
      <Circle cx="50" cy="89" r="2.8" fill="#ff3333" opacity="0.9" />
      <Circle cx="58" cy="89" r="2.8" fill="#33ff88" opacity="0.9" />
      {/* Écran */}
      <Rect x="38" y="94" width="24" height="5" rx="1.5" fill={visor} opacity="0.8" />
      {/* LED écran */}
      <Rect x="40" y="95.5" width="6" height="2" rx="1" fill={accent} opacity="0.6" />

      {/* Connecteur cou */}
      <Rect x="43" y="73" width="14" height="8" rx="3" fill={ring} />
      <Rect x="45" y="74" width="10" height="6" rx="2" fill={suitLight} opacity="0.5" />

      {/* ══ BRAS ══ */}
      <Path d="M 22 84 Q 7 90 5 106 L 17 109 Q 18 94 26 91 Z" fill={suit} />
      <Path d="M 78 84 Q 93 90 95 106 L 83 109 Q 82 94 74 91 Z" fill={suit} />
      {/* Coude / jointure */}
      <Circle cx="10" cy="107" r="9"   fill={suitLight} />
      <Circle cx="90" cy="107" r="9"   fill={suitLight} />
      {/* Gants */}
      <Circle cx="10" cy="107" r="7.5" fill={glove} />
      <Circle cx="90" cy="107" r="7.5" fill={glove} />
      {/* Doigts */}
      <Path d="M 4 103 Q 3 108 5 112"  stroke={suitDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M 16 103 Q 17 108 15 112" stroke={suitDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M 84 103 Q 83 108 85 112" stroke={suitDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M 96 103 Q 97 108 95 112" stroke={suitDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ══ ANNEAU DU CASQUE ══ */}
      <Ellipse cx="50" cy="75" rx="27" ry="7"   fill={ring} />
      <Ellipse cx="50" cy="75" rx="23" ry="4.5" fill={suitLight} opacity="0.5" />

      {/* ══ CASQUE ══ */}
      {/* Dôme extérieur */}
      <Ellipse cx="50" cy="45" rx="30" ry="32" fill="#eeeeee" />
      <Ellipse cx="50" cy="45" rx="28" ry="30" fill="#f8f8f8" />
      {/* Visor (visière) */}
      <Ellipse cx="50" cy="48" rx="21" ry="20" fill={visor} />
      {/* Reflets visor */}
      <Ellipse cx="39" cy="39" rx="7" ry="4" fill="white" opacity="0.28" transform="rotate(-20, 39, 39)" />
      <Ellipse cx="62" cy="57" rx="4" ry="3" fill="white" opacity="0.1" />

      {/* ══ VISAGE dans le visor ══ */}
      {/* Joues */}
      <Ellipse cx="33" cy="53" rx="6" ry="4" fill="#ff9999" opacity="0.42" />
      <Ellipse cx="67" cy="53" rx="6" ry="4" fill="#ff9999" opacity="0.42" />

      {/* Yeux */}
      {ouch ? (
        <>
          <Path d="M 36 43 L 48 55 M 36 55 L 48 43" stroke="#553300" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M 52 43 L 64 55 M 52 55 L 64 43" stroke="#553300" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="42" cy="47" r="8"   fill="white" />
          <Circle cx="58" cy="47" r="8"   fill="white" />
          <Circle cx="42" cy="47" r="5.5" fill="#334488" />
          <Circle cx="58" cy="47" r="5.5" fill="#334488" />
          <Circle cx="42" cy="47" r="3.2" fill="#0a0a22" />
          <Circle cx="58" cy="47" r="3.2" fill="#0a0a22" />
          <Circle cx="44" cy="44" r="2"   fill="white" />
          <Circle cx="60" cy="44" r="2"   fill="white" />
          <Circle cx="39" cy="50" r="1"   fill="white" opacity="0.5" />
          <Circle cx="55" cy="50" r="1"   fill="white" opacity="0.5" />
        </>
      )}

      {/* Bouche */}
      {ouch
        ? <Path d="M 43 60 Q 50 55 57 60" fill="none" stroke="#553300" strokeWidth="1.5" strokeLinecap="round" />
        : <Path d="M 43 58 Q 50 65 57 58" fill="none" stroke="#553300" strokeWidth="1.5" strokeLinecap="round" />
      }

      {/* ══ DÉTAILS CASQUE ══ */}
      {/* Lumières latérales */}
      <Circle cx="22" cy="38" r="3.5" fill={accent} />
      <Circle cx="78" cy="38" r="3.5" fill={accent} />
      <Circle cx="22" cy="38" r="1.8" fill="white" opacity="0.85" />
      <Circle cx="78" cy="38" r="1.8" fill="white" opacity="0.85" />
      {/* Antenne */}
      <Path d="M 50 13 L 50 20" stroke="#aaaaaa" strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="50" cy="11" r="3.5" fill={accent} />
      <Circle cx="50" cy="11" r="1.8" fill="white" opacity="0.8" />
      {/* Insigne NASA */}
      <Circle cx="63" cy="26" r="5" fill={panel} opacity="0.7" />
      <Circle cx="63" cy="26" r="3.5" fill={visor} opacity="0.6" />
    </Svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CharacterAstronaut({
  animLevel = 0, ouch = false, combo = 0,
  evolutionStage = 0, compressionRatio = 0,
}) {
  const [piecePlan] = useState(() => generateAstroPlan());

  const ty  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  const ouchShake    = useRef(new Animated.Value(0)).current;
  const compressAnim = useRef(new Animated.Value(0)).current;

  const [notes, setNotes] = useState([]);
  const noteId = useRef(0);

  // ── Idle bounce ──
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(ty, { toValue: -4, duration: 800, useNativeDriver: true }),
        Animated.timing(ty, { toValue:  0, duration: 800, useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, []);

  // ── Dance ──
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

  // ── Ouch shake ──
  useEffect(() => {
    if (!ouch) return;
    Animated.sequence([
      Animated.timing(ouchShake, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   6, duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [ouch]);

  // ── Compression ──
  useEffect(() => {
    Animated.timing(compressAnim, {
      toValue: compressionRatio, duration: 120, useNativeDriver: true,
    }).start();
  }, [compressionRatio]);

  const scaleY    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const scaleX    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.20] });
  const rotateDeg = rot.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] });

  // ── Notes musicales ──
  useEffect(() => {
    if (combo <= 0 || combo % 3 !== 0) return;
    const id = noteId.current++;
    const x = -20 + Math.random() * 50;
    setNotes(prev => [...prev, { id, x }]);
    setTimeout(() => setNotes(prev => prev.filter(n => n.id !== id)), 1000);
  }, [combo]);

  const colors = buildAstroColors(evolutionStage, piecePlan);

  return (
    <View style={{ width: 140, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      {notes.map(n => (
        <FloatNote key={n.id} color={colors.accent} startX={n.x + 30} />
      ))}

      <Animated.View style={{ transform: [{ scaleX }, { scaleY }] }}>
        <Animated.View style={{
          transform: [
            { translateY: ty },
            { rotate: rotateDeg },
            { translateX: ouchShake },
          ],
        }}>
          <AstronautSVG ouch={ouch} colors={colors} evolutionStage={evolutionStage} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
