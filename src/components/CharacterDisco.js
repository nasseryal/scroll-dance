// ── CharacterDisco — King of Disco, tenue paillettes progressive ──────────────
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, Line, Polygon, G } from 'react-native-svg';

// ─── Palette néon ─────────────────────────────────────────────────────────────
const NEON_PALETTE = [
  '#ff00ff', '#00ffff', '#ff0066', '#00ff88',
  '#cc00ff', '#ffff00', '#ff8800', '#ff3399',
  '#00ccff', '#aaff00',
];

// Pièces : 0=veste, 1=pantalon, 2=chapeau, 3=chaussures, 4=chemise, 5=ceinture, 6=nœud
const BASE_DISCO = {
  suit:      '#e07800',   // orange sequin
  suitDark:  '#9a4e00',
  suitLight: '#ffbb44',
  hat:       '#c86000',
  hatBrim:   '#d97000',
  hatAccent: '#ffd700',
  shirt:     '#fff8e0',
  belt:      '#5a3000',
  buckle:    '#ffd700',
  boot:      '#7a3800',
  bootSole:  '#3a1800',
  mic:       '#cccccc',
  skin:      '#f5c89a',
  skinDark:  '#d9a070',
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function darkenHex(hex, f = 0.55) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.floor(v * f).toString(16).padStart(2, '0')).join('');
}
function lightenHex(hex, f = 1.4) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return '#' + [r, g, b].map(v => Math.min(255, Math.floor(v * f)).toString(16).padStart(2, '0')).join('');
}

export function generateDiscoPlan() {
  const pieces = [...shuffleArray([0, 1, 2, 3, 4, 5, 6]), ...shuffleArray([0, 1, 2])];
  return pieces.map((piece, i) => ({ piece, color: NEON_PALETTE[(i * 3 + 5) % NEON_PALETTE.length] }));
}

export function buildDiscoColors(evolutionStage, plan) {
  const c = { ...BASE_DISCO };
  for (let i = 0; i < Math.min(evolutionStage, plan.length); i++) {
    const { piece, color } = plan[i];
    if (piece === 0) { c.suit = color; c.suitDark = darkenHex(color); c.suitLight = lightenHex(color); }
    if (piece === 1) { c.suit = c.suit; /* pantalon suit partagé */ }
    if (piece === 2) { c.hat = color; c.hatBrim = lightenHex(color, 1.2); c.hatAccent = lightenHex(color, 1.8); }
    if (piece === 3) { c.boot = darkenHex(color, 0.6); c.bootSole = darkenHex(color, 0.35); }
    if (piece === 4) { c.shirt = color; }
    if (piece === 5) { c.belt = darkenHex(color, 0.5); c.buckle = lightenHex(color, 1.6); }
    if (piece === 6) { c.mic = color; }
  }
  return c;
}

// ─── Note musicale flottante ──────────────────────────────────────────────────
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
    }}>{note}</Animated.Text>
  );
}

// ─── SVG personnage ───────────────────────────────────────────────────────────
function DiscoSVG({ ouch, c, evolutionStage }) {
  const { suit, suitDark, suitLight, hat, hatBrim, hatAccent, shirt, belt, buckle, boot, bootSole, mic, skin, skinDark } = c;

  const showMirrorBall = evolutionStage >= 6;
  const showLightRays  = evolutionStage >= 8;
  const showConstell   = evolutionStage >= 9;
  const showCrown      = evolutionStage >= 10;

  return (
    <Svg width={130} height={162} viewBox="0 0 100 130">

      {/* ══ STAGE 10 : COURONNE DISCO DIVINE ══ */}
      {showCrown && (
        <G>
          <Ellipse cx="50" cy="7" rx="18" ry="3.5" fill={hatAccent} opacity="0.4" />
          <Polygon points="50,0 53,7 50,6 47,7"   fill="#ffd700" opacity="0.95" />
          <Polygon points="41,2 44,8 41,7.5 39,8.5" fill="#ff00ff" opacity="0.9" />
          <Polygon points="59,2 56,8 59,7.5 61,8.5" fill="#00ffff" opacity="0.9" />
          <Polygon points="34,5 37,9 34.5,9 33,10"  fill="#ff0066" opacity="0.85" />
          <Polygon points="66,5 63,9 65.5,9 67,10"  fill="#aaff00" opacity="0.85" />
          <Circle cx="50" cy="1.5" r="2.5" fill="white" opacity="0.95" />
        </G>
      )}

      {/* ══ STAGE 9 : CONSTELLATION DE BOULES ══ */}
      {showConstell && (
        <G>
          {[
            [15, 18, 5], [82, 22, 4], [10, 45, 4.5], [88, 50, 5],
          ].map(([cx, cy, r], i) => (
            <G key={i}>
              <Circle cx={cx} cy={cy} r={r}    fill="#333" />
              <Circle cx={cx} cy={cy} r={r-1}  fill="#555" />
              {[0,45,90,135,180,225,270,315].map((a, j) => {
                const rad = (a * Math.PI) / 180;
                const nx = cx + (r-0.5) * Math.cos(rad);
                const ny = cy + (r-0.5) * Math.sin(rad);
                const cols = ['#ff00ff','#00ffff','#ffff00','#ff0066','#00ff88','#ff8800','#aaff00','#ff3399'];
                return <Circle key={j} cx={nx} cy={ny} r="0.7" fill={cols[j % cols.length]} opacity="0.9" />;
              })}
            </G>
          ))}
        </G>
      )}

      {/* ══ STAGE 8 : RAYONS LUMINEUX DU CHAPEAU ══ */}
      {showLightRays && (
        <G opacity="0.6">
          <Line x1="50" y1="14" x2="10"  y2="0"   stroke="#ffff00" strokeWidth="1.2" />
          <Line x1="50" y1="14" x2="30"  y2="0"   stroke="#ff00ff" strokeWidth="1.2" />
          <Line x1="50" y1="14" x2="50"  y2="0"   stroke="#00ffff" strokeWidth="1.2" />
          <Line x1="50" y1="14" x2="70"  y2="0"   stroke="#ff0066" strokeWidth="1.2" />
          <Line x1="50" y1="14" x2="90"  y2="0"   stroke="#aaff00" strokeWidth="1.2" />
          <Line x1="50" y1="14" x2="100" y2="8"   stroke="#ff8800" strokeWidth="1" />
          <Line x1="50" y1="14" x2="0"   y2="8"   stroke="#cc00ff" strokeWidth="1" />
        </G>
      )}

      {/* ══ STAGE 6 : BOULE À FACETTES FLOTTANTE ══ */}
      {showMirrorBall && (
        <G>
          <Circle cx="82" cy="20" r="9"  fill="#333" />
          <Circle cx="82" cy="20" r="8"  fill="#555" />
          {[0,45,90,135,180,225,270,315].map((a, i) => {
            const rad = (a * Math.PI) / 180;
            const nx = 82 + 7.5 * Math.cos(rad);
            const ny = 20 + 7.5 * Math.sin(rad);
            const cols = ['#ff00ff','#00ffff','#ffff00','#ff0066','#00ff88','#ff8800','#aaff00','#ff3399'];
            return <Circle key={i} cx={nx} cy={ny} r="1.2" fill={cols[i]} opacity="0.95" />;
          })}
          {/* Fil de suspension */}
          <Line x1="82" y1="11" x2="75" y2="4" stroke="#aaa" strokeWidth="0.8" />
        </G>
      )}

      {/* ══ JAMBES ══ */}
      <Rect x="35" y="92"  width="13" height="20" rx="4" fill={suit} />
      <Rect x="52" y="92"  width="13" height="20" rx="4" fill={suit} />
      {/* Bande latérale pantalon */}
      <Line x1="36" y1="93" x2="36" y2="111" stroke={suitLight} strokeWidth="0.8" opacity="0.8" />
      <Line x1="64" y1="93" x2="64" y2="111" stroke={suitLight} strokeWidth="0.8" opacity="0.8" />

      {/* ══ BOTTES PLATEFORMES ══ */}
      <Path d="M 30 110 L 30 122 Q 30 127 36 127 L 50 127 Q 53 127 53 122 L 53 110 Z" fill={boot} />
      <Path d="M 47 110 L 47 122 Q 47 127 53 127 L 67 127 Q 70 127 70 122 L 70 110 Z" fill={boot} />
      {/* Semelle épaisse plateforme */}
      <Rect x="29" y="121" width="25" height="5" rx="2" fill={bootSole} />
      <Rect x="46" y="121" width="25" height="5" rx="2" fill={bootSole} />
      {/* Reflet boot */}
      <Line x1="32" y1="113" x2="32" y2="120" stroke={suitLight} strokeWidth="0.8" opacity="0.5" />
      <Line x1="49" y1="113" x2="49" y2="120" stroke={suitLight} strokeWidth="0.8" opacity="0.5" />
      {/* Stage 3+ : LED bottes */}
      {evolutionStage >= 3 && (
        <>
          <Circle cx="38" cy="123" r="1.2" fill={suitLight} opacity="0.9" />
          <Circle cx="43" cy="123" r="1.2" fill="#ff00ff" opacity="0.9" />
          <Circle cx="55" cy="123" r="1.2" fill={suitLight} opacity="0.9" />
          <Circle cx="60" cy="123" r="1.2" fill="#00ffff" opacity="0.9" />
        </>
      )}

      {/* ══ CORPS / VESTE SEQUINS ══ */}
      <Path d="M 24 72 Q 21 95 24 96 L 76 96 Q 79 95 76 72 Q 65 66 50 66 Q 35 66 24 72 Z" fill={suit} />
      {/* Revers / lapel */}
      <Path d="M 40 68 L 50 78 L 60 68 L 56 64 L 50 66 L 44 64 Z" fill={suitDark} />
      <Path d="M 50 78 L 44 64 L 40 68 Z" fill={shirt} opacity="0.9" />
      <Path d="M 50 78 L 56 64 L 60 68 Z" fill={shirt} opacity="0.9" />
      {/* Bouton chemise */}
      <Circle cx="50" cy="80" r="1.5" fill={buckle} opacity="0.9" />
      <Circle cx="50" cy="86" r="1.5" fill={buckle} opacity="0.9" />

      {/* Paillettes / reflets sur la veste (points lumineux) */}
      {[
        [28, 76], [33, 82], [30, 90], [36, 88], [40, 94],
        [72, 76], [67, 82], [70, 90], [64, 88], [60, 94],
        [50, 72], [45, 86], [55, 86],
      ].map(([cx, cy], i) => (
        <Circle key={i} cx={cx} cy={cy} r="1" fill={suitLight} opacity="0.6" />
      ))}

      {/* Stage 2+ : liseré néon sur les bords de veste */}
      {evolutionStage >= 2 && (
        <>
          <Path d="M 24 72 Q 21 95 24 96" stroke={suitLight} strokeWidth="1.2" fill="none" opacity="0.8" />
          <Path d="M 76 72 Q 79 95 76 96" stroke={suitLight} strokeWidth="1.2" fill="none" opacity="0.8" />
          <Line x1="24" y1="96" x2="76" y2="96" stroke={suitLight} strokeWidth="1" opacity="0.6" />
        </>
      )}

      {/* ══ CEINTURE ══ */}
      <Rect x="28" y="90" width="44" height="6" rx="2" fill={belt} />
      <Rect x="44" y="89" width="12" height="8" rx="2" fill={buckle} />
      <Circle cx="50" cy="93" r="2.5" fill={suitDark} />
      <Circle cx="50" cy="93" r="1.5" fill={buckle} opacity="0.8" />
      {/* Stage 5+ : buckle glow */}
      {evolutionStage >= 5 && (
        <Circle cx="50" cy="93" r="4" fill={buckle} opacity="0.25" />
      )}

      {/* ══ ÉPAULES ══ */}
      <Ellipse cx="22" cy="74" rx="10" ry="7" fill={suitLight} />
      <Ellipse cx="78" cy="74" rx="10" ry="7" fill={suitLight} />
      <Ellipse cx="22" cy="74" rx="7"  ry="5" fill={suit} />
      <Ellipse cx="78" cy="74" rx="7"  ry="5" fill={suit} />

      {/* ══ BRAS GAUCHE (tient le micro) ══ */}
      <Path d="M 22 75 Q 8 82 6 98 L 17 101 Q 18 87 26 83 Z" fill={suit} />
      <Circle cx="11" cy="99" r="8"   fill={suitLight} />
      <Circle cx="11" cy="99" r="6.5" fill={skin} />
      {/* Micro dans la main */}
      <Rect x="5" y="85" width="5" height="14" rx="2.5" fill={mic} />
      <Ellipse cx="7.5" cy="84" rx="4.5" ry="4.5" fill="#333" />
      <Ellipse cx="7.5" cy="84" rx="3.5" ry="3.5" fill="#555" />
      <Circle  cx="7.5" cy="84" r="1.5" fill={mic} opacity="0.6" />
      {/* Stage 7+ : laser du micro */}
      {evolutionStage >= 7 && (
        <Line x1="7.5" y1="79" x2="0" y2="55" stroke="#ff0066" strokeWidth="1" opacity="0.8" strokeDasharray="2,2" />
      )}

      {/* ══ BRAS DROIT ══ */}
      <Path d="M 78 75 Q 92 82 94 98 L 83 101 Q 82 87 74 83 Z" fill={suit} />
      <Circle cx="89" cy="99" r="8"   fill={suitLight} />
      <Circle cx="89" cy="99" r="6.5" fill={skin} />

      {/* Stage 4+ : bracelet néon bras droit */}
      {evolutionStage >= 4 && (
        <Ellipse cx="83" cy="93" rx="5" ry="2" fill="none" stroke={suitLight} strokeWidth="1.5" opacity="0.8" />
      )}

      {/* ══ COU ══ */}
      <Rect x="44" y="57" width="12" height="10" rx="3" fill={skin} />

      {/* ══ TÊTE ══ */}
      <Ellipse cx="50" cy="40" rx="22" ry="22" fill={skin} />
      <Ellipse cx="34" cy="46" rx="5" ry="3.5" fill={skinDark} opacity="0.28" />
      <Ellipse cx="66" cy="46" rx="5" ry="3.5" fill={skinDark} opacity="0.28" />

      {/* ══ YEUX ══ */}
      {ouch ? (
        <>
          <Path d="M 37 36 L 47 46 M 37 46 L 47 36" stroke={skinDark} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M 53 36 L 63 46 M 53 46 L 63 36" stroke={skinDark} strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="41" cy="40" r="7.5" fill="white" />
          <Circle cx="59" cy="40" r="7.5" fill="white" />
          <Circle cx="41" cy="40" r="5.2" fill="#5511cc" />
          <Circle cx="59" cy="40" r="5.2" fill="#5511cc" />
          <Circle cx="41" cy="40" r="3"   fill="#1a0044" />
          <Circle cx="59" cy="40" r="3"   fill="#1a0044" />
          <Circle cx="43" cy="37" r="1.8" fill="white" />
          <Circle cx="61" cy="37" r="1.8" fill="white" />
          <Circle cx="38" cy="43" r="0.9" fill="white" opacity="0.5" />
          <Circle cx="56" cy="43" r="0.9" fill="white" opacity="0.5" />
        </>
      )}
      {/* Sourcils */}
      <Path d="M 35 31 Q 41 29 47 31" stroke={skinDark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Path d="M 53 31 Q 59 29 65 31" stroke={skinDark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Bouche */}
      {ouch
        ? <Path d="M 44 52 Q 50 48 56 52" fill="none" stroke={skinDark} strokeWidth="1.5" strokeLinecap="round" />
        : <Path d="M 44 51 Q 50 57 56 51" fill="none" stroke={skinDark} strokeWidth="1.5" strokeLinecap="round" />
      }

      {/* ══ CHAPEAU DISCO ══ */}
      {/* Couronne du chapeau */}
      <Path d="M 28 26 Q 30 10 50 9 Q 70 10 72 26 Z" fill={hat} />
      {/* Bande décorative */}
      <Rect x="27" y="24" width="46" height="5" rx="1" fill={suitDark} />
      <Rect x="27" y="25" width="46" height="2" rx="1" fill={hatAccent} opacity="0.8" />
      {/* Bord du chapeau (brim) */}
      <Ellipse cx="50" cy="27" rx="27" ry="5.5" fill={hatBrim} />
      <Ellipse cx="50" cy="26" rx="25" ry="3.5" fill={hat} />
      {/* Paillettes chapeau */}
      {[
        [35, 16], [42, 12], [50, 11], [58, 12], [65, 16],
        [40, 18], [50, 17], [60, 18],
      ].map(([cx, cy], i) => (
        <Circle key={i} cx={cx} cy={cy} r="0.9" fill={hatAccent} opacity="0.85" />
      ))}
      {/* Insigne central chapeau */}
      <Circle cx="50" cy="14" r="4"   fill={suitDark} opacity="0.8" />
      <Circle cx="50" cy="14" r="2.8" fill={hatAccent} opacity="0.9" />
      <Circle cx="50" cy="14" r="1.4" fill="white" opacity="0.9" />

      {/* Stage 5+ : aura scintillante */}
      {evolutionStage >= 5 && (
        <G opacity="0.35">
          <Circle cx="50" cy="40" r="30" fill={suitLight} />
          <Circle cx="50" cy="40" r="24" fill="white" />
        </G>
      )}

    </Svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CharacterDisco({
  animLevel = 0, ouch = false, combo = 0,
  evolutionStage = 0, compressionRatio = 0,
}) {
  const [piecePlan] = useState(() => generateDiscoPlan());

  const ty         = useRef(new Animated.Value(0)).current;
  const rot        = useRef(new Animated.Value(0)).current;
  const ouchShake  = useRef(new Animated.Value(0)).current;
  const compressAnim = useRef(new Animated.Value(0)).current;
  const [notes, setNotes] = useState([]);
  const noteId = useRef(0);

  // Idle bounce
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

  // Dance
  useEffect(() => {
    if (animLevel === 0) return;
    const intensity = animLevel * 3;
    const dur = Math.max(180, 360 - animLevel * 40);
    const a = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ty,  { toValue: -intensity,       duration: dur, useNativeDriver: true }),
          Animated.timing(rot, { toValue:  intensity * 0.3, duration: dur, useNativeDriver: true }),
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

  // Ouch shake
  useEffect(() => {
    if (!ouch) return;
    Animated.sequence([
      Animated.timing(ouchShake, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   6, duration: 50, useNativeDriver: true }),
      Animated.timing(ouchShake, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [ouch]);

  // Compression
  useEffect(() => {
    Animated.timing(compressAnim, {
      toValue: compressionRatio, duration: 120, useNativeDriver: true,
    }).start();
  }, [compressionRatio]);

  const scaleY    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const scaleX    = compressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.20] });
  const rotateDeg = rot.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] });

  // Notes musicales
  useEffect(() => {
    if (combo <= 0 || combo % 3 !== 0) return;
    const id = noteId.current++;
    const x = -20 + Math.random() * 50;
    setNotes(prev => [...prev, { id, x }]);
    setTimeout(() => setNotes(prev => prev.filter(n => n.id !== id)), 1000);
  }, [combo]);

  const colors = buildDiscoColors(evolutionStage, piecePlan);

  return (
    <View style={{ width: 140, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      {notes.map(n => (
        <FloatNote key={n.id} color={colors.suitLight} startX={n.x + 30} />
      ))}
      <Animated.View style={{ transform: [{ scaleX }, { scaleY }] }}>
        <Animated.View style={{
          transform: [
            { translateY: ty },
            { rotate: rotateDeg },
            { translateX: ouchShake },
          ],
        }}>
          <DiscoSVG ouch={ouch} c={colors} evolutionStage={evolutionStage} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
