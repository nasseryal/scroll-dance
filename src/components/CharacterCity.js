// ── CharacterCity — Cyberpunk Street Kid ──────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, {
  Ellipse, Rect, Circle, Path, Line, Polygon, G,
} from 'react-native-svg';

// ── Palette néon de base ──────────────────────────────────────────────────────
const BASE_CITY = {
  skin:       '#f5c89a',
  skinDark:   '#d9a070',
  hair:       '#1a1a2e',
  hairLight:  '#2e2e5e',
  jacket:     '#1a1a2e',
  jacketDark: '#0d0d1a',
  jacketTrim: '#00eeff',
  shirt:      '#e0e0e0',
  pants:      '#2a2a4a',
  pantsDark:  '#1a1a3a',
  shoes:      '#111111',
  shoesSole:  '#333333',
  belt:       '#333333',
  buckle:     '#ffaa00',
  badge:      '#00eeff',
};

const NEON_PALETTE = [
  '#ff00ff','#00ffff','#ff0066','#00ff88','#cc00ff',
  '#ffff00','#ff8800','#aaff00','#ff3399','#00ccff',
  '#ff44aa','#44ffcc','#bb00ff','#ff6600','#00ff44',
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function darkenHex(hex, amt = 40) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function lightenHex(hex, amt = 40) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Pièces : 0=jacket, 1=pants, 2=shoes, 3=hair, 4=shirt, 5=belt, 6=badge/trim
export function generateCityPlan() {
  const pieces = shuffleArray([0, 1, 2, 3, 4, 5, 6]);
  const extra  = shuffleArray([0, 1, 2, 3, 4, 5, 6]);
  const full   = [...pieces, extra[0], extra[1], extra[2]];
  return full.map((piece, idx) => ({
    piece,
    color: NEON_PALETTE[(idx * 3 + 7) % NEON_PALETTE.length],
  }));
}

export function buildCityColors(evolutionStage, plan) {
  const c = { ...BASE_CITY };
  const count = Math.min(evolutionStage, plan.length);
  for (let i = 0; i < count; i++) {
    const { piece, color } = plan[i];
    if (piece === 0) { c.jacket = color; c.jacketDark = darkenHex(color, 50); c.jacketTrim = lightenHex(color, 60); }
    if (piece === 1) { c.pants = color; c.pantsDark = darkenHex(color, 40); }
    if (piece === 2) { c.shoes = color; c.shoesSole = lightenHex(color, 30); }
    if (piece === 3) { c.hair = color; c.hairLight = lightenHex(color, 40); }
    if (piece === 4) { c.shirt = color; }
    if (piece === 5) { c.belt = color; c.buckle = lightenHex(color, 50); }
    if (piece === 6) { c.badge = color; }
  }
  return c;
}

// ── SVG ───────────────────────────────────────────────────────────────────────
function CitySVG({ c, evolutionStage, compressionRatio = 0 }) {
  const squat = 1 + compressionRatio * 0.14;
  const scaleY = 1 / squat;

  return (
    <Svg width={130} height={162} viewBox="0 0 100 130">
      <G transform={`translate(50, ${65 + compressionRatio * 5}) scale(1, ${scaleY}) translate(-50, ${-(65 + compressionRatio * 5)})`}>

        {/* ── Jambes / pantalon ── */}
        <Rect x="38" y="84" width="11" height="24" rx="3" fill={c.pants} />
        <Rect x="51" y="84" width="11" height="24" rx="3" fill={c.pants} />
        {/* coutures */}
        <Line x1="43.5" y1="84" x2="43.5" y2="108" stroke={c.pantsDark} strokeWidth="1" />
        <Line x1="56.5" y1="84" x2="56.5" y2="108" stroke={c.pantsDark} strokeWidth="1" />

        {/* ── Chaussures ── */}
        <Ellipse cx="43.5" cy="110" rx="7.5" ry="3.5" fill={c.shoes} />
        <Ellipse cx="56.5" cy="110" rx="7.5" ry="3.5" fill={c.shoes} />
        {/* semelle */}
        <Rect x="36" y="110" width="15" height="2" rx="1" fill={c.shoesSole} />
        <Rect x="49" y="110" width="15" height="2" rx="1" fill={c.shoesSole} />
        {/* logo/stripe */}
        <Line x1="38" y1="109" x2="47" y2="109" stroke={c.badge} strokeWidth="1.2" />
        <Line x1="51" y1="109" x2="60" y2="109" stroke={c.badge} strokeWidth="1.2" />

        {/* ── Ceinture ── */}
        <Rect x="36" y="83" width="28" height="4" rx="1.5" fill={c.belt} />
        <Rect x="47" y="82.5" width="6" height="5" rx="1" fill={c.buckle} />
        {/* détail ceinture néon */}
        {evolutionStage >= 2 && (
          <>
            <Rect x="36" y="83.5" width="28" height="0.8" fill={c.badge} opacity="0.7" />
            <Rect x="38" y="85.5" width="4" height="1.2" rx="0.6" fill={c.badge} />
            <Rect x="58" y="85.5" width="4" height="1.2" rx="0.6" fill={c.badge} />
          </>
        )}

        {/* ── Corps / chemise ── */}
        <Rect x="34" y="60" width="32" height="26" rx="5" fill={c.shirt} />

        {/* ── Veste ── */}
        <Path d="M34,62 L34,86 L42,86 L42,64 Z" fill={c.jacket} />
        <Path d="M66,62 L66,86 L58,86 L58,64 Z" fill={c.jacket} />
        {/* col veste */}
        <Path d="M34,62 L42,68 L50,64 L58,68 L66,62 L62,58 L50,60 L38,58 Z" fill={c.jacketDark} />
        {/* liseré néon veste */}
        <Line x1="42" y1="64" x2="42" y2="86" stroke={c.jacketTrim} strokeWidth="1" />
        <Line x1="58" y1="64" x2="58" y2="86" stroke={c.jacketTrim} strokeWidth="1" />
        {/* badge épaule gauche */}
        <Rect x="34" y="68" width="7" height="4" rx="1" fill={c.badge} opacity="0.9" />
        <Rect x="35" y="70" width="5" height="0.8" fill={c.jacketDark} />

        {/* ── Bras gauche ── */}
        <Rect x="24" y="62" width="10" height="18" rx="4" fill={c.jacket} />
        <Rect x="24" y="62" width="10" height="3" rx="2" fill={c.jacketDark} />
        {/* ligne néon bras */}
        <Line x1="24" y1="65" x2="24" y2="79" stroke={c.jacketTrim} strokeWidth="0.8" />

        {/* ── Bras droit ── */}
        <Rect x="66" y="62" width="10" height="18" rx="4" fill={c.jacket} />
        <Rect x="66" y="62" width="10" height="3" rx="2" fill={c.jacketDark} />
        <Line x1="76" y1="65" x2="76" y2="79" stroke={c.jacketTrim} strokeWidth="0.8" />

        {/* ── Mains ── */}
        <Ellipse cx="29" cy="81" rx="5" ry="4.5" fill={c.skin} />
        <Ellipse cx="71" cy="81" rx="5" ry="4.5" fill={c.skin} />

        {/* ── Cou ── */}
        <Rect x="46" y="52" width="8" height="10" rx="3" fill={c.skin} />

        {/* ── Tête ── */}
        <Ellipse cx="50" cy="38" rx="22" ry="22" fill={c.skin} />
        {/* joues */}
        <Circle cx="33" cy="42" r="4" fill={c.skinDark} opacity="0.3" />
        <Circle cx="67" cy="42" r="4" fill={c.skinDark} opacity="0.3" />

        {/* ── Cheveux ── */}
        {/* Base */}
        <Ellipse cx="50" cy="22" rx="22" ry="12" fill={c.hair} />
        <Rect x="28" y="18" width="44" height="12" rx="4" fill={c.hair} />
        {/* mèches avant */}
        <Path d="M32,26 Q28,20 30,16 Q34,14 36,20 Z" fill={c.hairLight} />
        <Path d="M40,22 Q38,16 42,14 Q46,13 45,20 Z" fill={c.hair} />
        <Path d="M68,26 Q72,20 70,16 Q66,14 64,20 Z" fill={c.hairLight} />
        {/* coté */}
        <Rect x="28" y="20" width="6" height="20" rx="3" fill={c.hair} />
        <Rect x="66" y="20" width="6" height="20" rx="3" fill={c.hair} />

        {/* ── Yeux ── */}
        {/* gauche */}
        <Ellipse cx="40" cy="40" rx="6" ry="6.5" fill="white" />
        <Ellipse cx="40" cy="40.5" rx="4" ry="4.5" fill="#1a1a2e" />
        <Ellipse cx="40" cy="40.5" rx="2.5" ry="2.5" fill="#5522ff" />
        <Circle  cx="41.5" cy="39" r="1.2" fill="white" />
        {/* droit */}
        <Ellipse cx="60" cy="40" rx="6" ry="6.5" fill="white" />
        <Ellipse cx="60" cy="40.5" rx="4" ry="4.5" fill="#1a1a2e" />
        <Ellipse cx="60" cy="40.5" rx="2.5" ry="2.5" fill="#5522ff" />
        <Circle  cx="61.5" cy="39" r="1.2" fill="white" />
        {/* sourcils */}
        <Path d="M35,33 Q40,31 45,33" stroke={c.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Path d="M55,33 Q60,31 65,33" stroke={c.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* ── Nez / bouche ── */}
        <Ellipse cx="50" cy="46" rx="1.5" ry="1" fill={c.skinDark} opacity="0.5" />
        <Path d="M46,51 Q50,54 54,51" stroke={c.skinDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ── Accessoires progressifs ── */}

        {/* Stage 2+ : sous-verre néon (cyber-glasses légères) */}
        {evolutionStage >= 2 && (
          <>
            <Rect x="33" y="37" width="14" height="8" rx="3" fill={c.badge} opacity="0.18" stroke={c.badge} strokeWidth="0.8" />
            <Rect x="53" y="37" width="14" height="8" rx="3" fill={c.badge} opacity="0.18" stroke={c.badge} strokeWidth="0.8" />
            <Line x1="47" y1="41" x2="53" y2="41" stroke={c.badge} strokeWidth="0.8" />
          </>
        )}

        {/* Stage 3+ : oreillette cyber */}
        {evolutionStage >= 3 && (
          <>
            <Rect x="26" y="36" width="5" height="9" rx="2" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.7" />
            <Circle cx="28.5" cy="38" r="1.2" fill={c.badge} />
            <Line x1="26" y1="41" x2="22" y2="41" stroke={c.badge} strokeWidth="0.8" />
          </>
        )}

        {/* Stage 4+ : circuits néon sur la veste */}
        {evolutionStage >= 4 && (
          <>
            <Path d="M35,72 L37,72 L37,76 L40,76" stroke={c.badge} strokeWidth="0.7" fill="none" />
            <Circle cx="40" cy="76" r="0.8" fill={c.badge} />
            <Path d="M65,72 L63,72 L63,76 L60,76" stroke={c.badge} strokeWidth="0.7" fill="none" />
            <Circle cx="60" cy="76" r="0.8" fill={c.badge} />
          </>
        )}

        {/* Stage 5+ : tablette holographique main gauche */}
        {evolutionStage >= 5 && (
          <G>
            <Rect x="14" y="74" width="14" height="10" rx="1.5" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.8" />
            <Rect x="15" y="75" width="12" height="8" rx="1" fill={c.badge} opacity="0.22" />
            <Line x1="15" y1="77.5" x2="27" y2="77.5" stroke={c.badge} strokeWidth="0.5" opacity="0.7" />
            <Line x1="15" y1="79.5" x2="24" y2="79.5" stroke={c.badge} strokeWidth="0.5" opacity="0.5" />
            <Line x1="15" y1="81.5" x2="26" y2="81.5" stroke={c.badge} strokeWidth="0.5" opacity="0.4" />
          </G>
        )}

        {/* Stage 6+ : visor plein (remplace lunettes légères) */}
        {evolutionStage >= 6 && (
          <>
            <Rect x="30" y="35" width="40" height="11" rx="4" fill={c.jacketDark} opacity="0.85" stroke={c.badge} strokeWidth="1" />
            <Rect x="31" y="36" width="38" height="9" rx="3" fill={c.badge} opacity="0.25" />
            {/* scan line */}
            <Line x1="31" y1="41" x2="69" y2="41" stroke={c.badge} strokeWidth="0.6" opacity="0.8" />
            <Circle cx="34" cy="40.5" r="1" fill={c.badge} opacity="0.9" />
            <Circle cx="66" cy="40.5" r="1" fill={c.badge} opacity="0.9" />
          </>
        )}

        {/* Stage 7+ : épaulette armure droite */}
        {evolutionStage >= 7 && (
          <>
            <Path d="M66,58 L78,60 L80,68 L66,68 Z" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.8" />
            <Line x1="68" y1="61" x2="78" y2="63" stroke={c.badge} strokeWidth="0.5" opacity="0.7" />
            <Line x1="68" y1="64" x2="76" y2="65" stroke={c.badge} strokeWidth="0.5" opacity="0.5" />
          </>
        )}

        {/* Stage 8+ : drone mini au-dessus droite */}
        {evolutionStage >= 8 && (
          <G>
            {/* corps drone */}
            <Rect x="68" y="10" width="18" height="8" rx="3" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.8" />
            {/* rotors */}
            <Ellipse cx="69" cy="10" rx="4" ry="1.2" fill={c.badge} opacity="0.7" />
            <Ellipse cx="85" cy="10" rx="4" ry="1.2" fill={c.badge} opacity="0.7" />
            <Ellipse cx="69" cy="18" rx="4" ry="1.2" fill={c.badge} opacity="0.7" />
            <Ellipse cx="85" cy="18" rx="4" ry="1.2" fill={c.badge} opacity="0.7" />
            {/* LED */}
            <Circle cx="77" cy="14" r="1.5" fill={c.badge} />
            {/* fil tether */}
            <Path d="M74,18 Q72,22 70,26" stroke={c.badge} strokeWidth="0.6" fill="none" opacity="0.6" />
          </G>
        )}

        {/* Stage 9+ : bras mech (gauche) + pistolet photon */}
        {evolutionStage >= 9 && (
          <G>
            {/* bras mech */}
            <Rect x="18" y="62" width="11" height="18" rx="4" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.7" />
            <Line x1="19" y1="66" x2="28" y2="66" stroke={c.badge} strokeWidth="0.5" />
            <Line x1="19" y1="70" x2="28" y2="70" stroke={c.badge} strokeWidth="0.5" />
            <Line x1="19" y1="74" x2="28" y2="74" stroke={c.badge} strokeWidth="0.5" />
            {/* articulations */}
            <Circle cx="23.5" cy="66" r="1.2" fill={c.badge} />
            <Circle cx="23.5" cy="74" r="1.2" fill={c.badge} />
            {/* pistolet */}
            <Rect x="10" y="77" width="13" height="5" rx="1.5" fill={c.jacketDark} stroke={c.badge} strokeWidth="0.7" />
            <Rect x="7"  y="77" width="4"  height="3.5" rx="0.8" fill={c.badge} opacity="0.9" />
            <Rect x="13" y="79" width="4"  height="2.5" rx="0.5" fill={c.jacketDark} />
            <Circle cx="8.5" cy="78.5" r="0.8" fill="white" opacity="0.9" />
          </G>
        )}

        {/* Stage 10 : couronne holo cyber */}
        {evolutionStage >= 10 && (
          <G>
            {/* anneau de base */}
            <Ellipse cx="50" cy="17" rx="20" ry="4" fill="none" stroke={c.badge} strokeWidth="1.2" opacity="0.9" />
            {/* piques holo */}
            <Polygon points="50,4 53,14 50,13 47,14" fill={c.badge} opacity="0.9" />
            <Polygon points="40,7 43,15 40,14.5 38,15.5" fill="#ff00ff" opacity="0.85" />
            <Polygon points="60,7 57,15 60,14.5 62,15.5" fill="#00ffff" opacity="0.85" />
            <Polygon points="34,12 37,17 34.5,17 33,18" fill="#ff0066" opacity="0.8" />
            <Polygon points="66,12 63,17 65.5,17 67,18" fill="#aaff00" opacity="0.8" />
            {/* gem centrale */}
            <Polygon points="50,5 53,10 50,12 47,10" fill="white" opacity="0.9" />
            <Polygon points="50,6 52,10 50,11 48,10" fill={c.badge} opacity="0.9" />
          </G>
        )}

      </G>
    </Svg>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function CharacterCity({
  animLevel = 0,
  ouch = false,
  combo = 0,
  evolutionStage = 0,
  compressionRatio = 0,
}) {
  const plan   = React.useState(() => generateCityPlan())[0];
  const colors = buildCityColors(evolutionStage, plan);

  const bounceY   = useRef(new Animated.Value(0)).current;
  const shakeX    = useRef(new Animated.Value(0)).current;
  const noteOpL   = useRef(new Animated.Value(0)).current;
  const noteOpR   = useRef(new Animated.Value(0)).current;
  const noteYL    = useRef(new Animated.Value(0)).current;
  const noteYR    = useRef(new Animated.Value(0)).current;
  const danceAnim = useRef(new Animated.Value(0)).current;
  const prevOuch  = useRef(false);
  const prevCombo = useRef(combo);
  const danceLoop = useRef(null);

  // idle bounce
  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceY, { toValue: -4, duration: 500, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue:  0, duration: 500, useNativeDriver: true }),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, []);

  // dance
  useEffect(() => {
    if (danceLoop.current) { danceLoop.current.stop(); danceLoop.current = null; }
    if (animLevel === 0) { danceAnim.setValue(0); return; }
    const speed = [0, 280, 200, 140, 90][animLevel] || 90;
    const range = [0, 5, 9, 13, 17][animLevel] || 17;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(danceAnim, { toValue:  range, duration: speed, useNativeDriver: true }),
        Animated.timing(danceAnim, { toValue: -range, duration: speed, useNativeDriver: true }),
      ])
    );
    loop.start();
    danceLoop.current = loop;
    return () => loop.stop();
  }, [animLevel]);

  // ouch shake
  useEffect(() => {
    if (ouch && !prevOuch.current) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue:  8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
    prevOuch.current = ouch;
  }, [ouch]);

  // notes musicales tous les 3 combos
  useEffect(() => {
    if (combo > 0 && combo !== prevCombo.current && combo % 3 === 0) {
      noteYL.setValue(0); noteYR.setValue(0);
      noteOpL.setValue(1); noteOpR.setValue(1);
      Animated.parallel([
        Animated.timing(noteYL, { toValue: -28, duration: 700, useNativeDriver: true }),
        Animated.timing(noteOpL, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(130),
          Animated.timing(noteYR, { toValue: -28, duration: 700, useNativeDriver: true }),
          Animated.timing(noteOpR, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ]).start();
    }
    prevCombo.current = combo;
  }, [combo]);

  const noteColor = ['#00eeff','#ff00ff','#00ff88','#ffff00','#ff0066',
                     '#cc00ff','#ff8800','#aaff00','#ff3399','#00ccff'][evolutionStage] || '#00eeff';

  return (
    <View style={{ width: 140, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      {/* Notes musicales */}
      <Animated.Text style={{
        position: 'absolute', top: 10, left: 16,
        opacity: noteOpL, transform: [{ translateY: noteYL }],
        color: noteColor, fontSize: 16, fontWeight: 'bold',
      }}>♪</Animated.Text>
      <Animated.Text style={{
        position: 'absolute', top: 18, right: 16,
        opacity: noteOpR, transform: [{ translateY: noteYR }],
        color: noteColor, fontSize: 13, fontWeight: 'bold',
      }}>♫</Animated.Text>

      {/* Personnage */}
      <Animated.View style={{
        transform: [
          { translateY: bounceY },
          { translateX: Animated.add(shakeX, danceAnim) },
        ],
      }}>
        <CitySVG c={colors} evolutionStage={evolutionStage} compressionRatio={compressionRatio} />
      </Animated.View>
    </View>
  );
}
