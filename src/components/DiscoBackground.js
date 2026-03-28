// ── Disco Pop Néon Background — plateau DDR / dance floor ────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import Svg, { Rect, Circle, G, Defs, RadialGradient, Stop, Line, Path } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// ── LCG seeded ────────────────────────────────────────────────────────────────
function makeRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Palette Disco ─────────────────────────────────────────────────────────────
const NEON_COLORS  = ['#ff00ff','#00ffff','#ff0066','#ffff00','#ff6600','#00ff88','#ff33cc','#33ccff','#ff3399','#aaff00'];
const TILE_COLORS  = [
  '#1a0033','#00001a','#1a001a','#000d1a',
  '#1a0026','#001a1a','#0d001a','#001a0d',
];
const SPOT_COLORS  = ['#ff00ff','#00ffff','#ff0066','#ffff00','#ff6600','#ff33cc','#00ff88'];
const LASER_COLORS = ['#ff00ff','#00ffff','#ff0066','#33ff99','#ffff00'];
const CONFETTI_COLS= ['#ff00ff','#ffff00','#00ffff','#ff6600','#ff3399','#33ff00','#ffffff','#ff0066'];

// ═══════════════════════════════════════════════════════════════════════════════
// SOL DDR — grille de tuiles qui flashent en rythme
// ═══════════════════════════════════════════════════════════════════════════════
const TILE_SIZE  = SW / 4;
const COLS       = Math.ceil(SW / TILE_SIZE) + 2;
const TILE_H_RATIO = 0.55;
const FLOOR_Y    = SH * 0.52;
const FLOOR_H    = SH - FLOOR_Y;

// Génère les tuiles une seule fois
const TILES = Array.from({ length: COLS * 8 }, (_, i) => {
  const r   = makeRand(i * 4447 + 0xD15C0);
  const col = Math.floor(i % COLS);
  const row = Math.floor(i / COLS);
  return {
    id:    i,
    col,   row,
    color: NEON_COLORS[Math.floor(r() * NEON_COLORS.length)],
    bg:    TILE_COLORS[Math.floor(r() * TILE_COLORS.length)],
    // délai et durée du flash indépendants
    delay: r() * 3000,
    dur:   80 + r() * 60,
    offDur:6000 + r() * 8000,
    maxOp: 0.18 + r() * 0.12,
  };
});

function FloorTile({ col, row, color, bg, delay, dur, offDur, maxOp }) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(glow, { toValue: maxOp, duration: dur,    useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0,     duration: dur,    useNativeDriver: false }),
        Animated.delay(offDur),
      ])
    ).start();
  }, []);

  const x = col * TILE_SIZE;
  const y = FLOOR_Y + row * TILE_SIZE * 0.38;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x, top: y,
        width: TILE_SIZE - 2,
        height: TILE_SIZE * 0.55 - 2,
        backgroundColor: 'transparent',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: color,
        shadowOpacity: glow,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Animated.View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: color,
        opacity: glow,
      }} />
    </Animated.View>
  );
}

function DanceFloor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {TILES.map(t => <FloorTile key={t.id} {...t} />)}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOULE DISCO — miroir ball en SVG qui tourne et projette des éclats
// ═══════════════════════════════════════════════════════════════════════════════
const BALL_R  = 38;
const BALL_CX = SW / 2;
const BALL_CY = SH * 0.14;

// Facettes de la boule
const FACETS = Array.from({ length: 64 }, (_, i) => {
  const r   = makeRand(i * 3571 + 0xB411);
  const row = Math.floor(i / 8);
  const col = i % 8;
  return {
    id: i,
    x:  (col / 8) * BALL_R * 2 - BALL_R + (row % 2) * (BALL_R / 8),
    y:  (row / 8) * BALL_R * 2 - BALL_R,
    w:  BALL_R / 4 - 1,
    h:  BALL_R / 4 - 1,
    color: NEON_COLORS[Math.floor(r() * NEON_COLORS.length)],
    bright: r() > 0.6,
  };
});

// Éclats de lumière projetés par la boule
const N_BEAMS = 20;
const BEAMS   = Array.from({ length: N_BEAMS }, (_, i) => {
  const r = makeRand(i * 6661 + 0xF4C3);
  return {
    id:    i,
    angle: (i / N_BEAMS) * 360,
    len:   SW * (0.4 + r() * 0.7),
    color: NEON_COLORS[Math.floor(r() * NEON_COLORS.length)],
    delay: r() * 2000,
    dur:   400 + r() * 600,
  };
});

function DiscoBeam({ angle, len, color, delay, dur }) {
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: 0.55, duration: dur,     useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,    duration: dur * 2, useNativeDriver: true }),
        Animated.delay(200 + Math.random() * 1500),
      ])
    ).start();
  }, []);

  const rad = (angle * Math.PI) / 180;
  const ex  = BALL_CX + Math.cos(rad) * len;
  const ey  = BALL_CY + Math.sin(rad) * len;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: op }]}>
      <Svg width={SW} height={SH}>
        <Line
          x1={BALL_CX} y1={BALL_CY}
          x2={ex}      y2={ey}
          stroke={color}
          strokeWidth={1.2}
          opacity="0.7"
        />
      </Svg>
    </Animated.View>
  );
}

function DiscoBall() {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <>
      {/* Éclats projetés */}
      {BEAMS.map(b => <DiscoBeam key={b.id} {...b} />)}

      {/* Fil de suspension */}
      <View pointerEvents="none" style={{
        position: 'absolute',
        top: 0, left: BALL_CX - 0.5,
        width: 1, height: BALL_CY - BALL_R,
        backgroundColor: 'rgba(255,255,255,0.25)',
      }} />

      {/* Boule */}
      <Animated.View pointerEvents="none" style={{
        position: 'absolute',
        top:  BALL_CY - BALL_R,
        left: BALL_CX - BALL_R,
        width:  BALL_R * 2,
        height: BALL_R * 2,
        borderRadius: BALL_R,
        overflow: 'hidden',
        backgroundColor: '#111',
        shadowColor: '#ffffff',
        shadowOpacity: 0.6,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ rotate }],
      }}>
        {/* Facettes miroir */}
        {FACETS.map(f => (
          <View key={f.id} style={{
            position: 'absolute',
            left: BALL_R + f.x, top: BALL_R + f.y,
            width: f.w, height: f.h,
            backgroundColor: f.bright ? f.color : 'rgba(200,200,200,0.4)',
            opacity: f.bright ? 0.9 : 0.35,
          }} />
        ))}
        {/* Reflet principal */}
        <View style={{
          position: 'absolute',
          top: BALL_R * 0.15, left: BALL_R * 0.25,
          width: BALL_R * 0.4, height: BALL_R * 0.25,
          borderRadius: BALL_R * 0.2,
          backgroundColor: 'rgba(255,255,255,0.55)',
          transform: [{ rotate: '-30deg' }],
        }} />
      </Animated.View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPOTS / PROJECTEURS — cônes de lumière colorés qui balayent
// ═══════════════════════════════════════════════════════════════════════════════
const N_SPOTS = 6;
const SPOTS   = Array.from({ length: N_SPOTS }, (_, i) => {
  const r = makeRand(i * 5003 + 0xA77E);
  return {
    id:    i,
    x:     SW * (0.05 + (i / N_SPOTS) * 0.9),
    color: SPOT_COLORS[Math.floor(r() * SPOT_COLORS.length)],
    swayDur: 2000 + r() * 3000,
    swayAmp: 35 + r() * 60,
    delay:   r() * 2500,
    phaseDir: r() > 0.5 ? 1 : -1,
  };
});

function Spot({ x, color, swayDur, swayAmp, delay, phaseDir }) {
  const sway = useRef(new Animated.Value(0)).current;
  const op   = useRef(new Animated.Value(0.18)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(sway, { toValue:  phaseDir * swayAmp, duration: swayDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: -phaseDir * swayAmp, duration: swayDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 0.38, duration: swayDur * 0.5, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.12, duration: swayDur * 0.5, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const coneH = FLOOR_Y * 0.95;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: x - 2,
        opacity: op,
        transform: [{ translateX: sway }],
      }}
    >
      <Svg width={80} height={coneH}>
        <Defs>
          <RadialGradient id={`sg${x}`} cx="50%" cy="0%" r="100%">
            <Stop offset="0%"   stopColor={color} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={color} stopOpacity="0"   />
          </RadialGradient>
        </Defs>
        {/* Cône de lumière */}
        <Path
          d={`M 40 0 L 80 ${coneH} L 0 ${coneH} Z`}
          fill={`url(#sg${x})`}
        />
        {/* Disque au sol */}
        <Circle cx={40} cy={coneH} r={38} fill={color} opacity="0.18" />
      </Svg>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LASERS — faisceaux horizontaux / diagonaux qui traversent la scène
// ═══════════════════════════════════════════════════════════════════════════════
const N_LASERS = 8;
const LASERS   = Array.from({ length: N_LASERS }, (_, i) => {
  const r = makeRand(i * 7127 + 0x1A5E);
  return {
    id:     i,
    y:      SH * (0.08 + r() * 0.42),
    color:  LASER_COLORS[Math.floor(r() * LASER_COLORS.length)],
    angle:  (r() - 0.5) * 22,
    dur:    200 + r() * 300,
    offDur: 500 + r() * 2500,
    delay:  r() * 3500,
    thick:  0.8 + r() * 1.5,
  };
});

function Laser({ y, color, angle, dur, offDur, delay, thick }) {
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: 0.85, duration: dur,    useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,    duration: dur,    useNativeDriver: true }),
        Animated.delay(offDur),
      ])
    ).start();
  }, []);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: op }]}>
      <Svg width={SW} height={SH}>
        <Line
          x1={0}  y1={y}
          x2={SW} y2={y + Math.tan((angle * Math.PI) / 180) * SW}
          stroke={color}
          strokeWidth={thick}
          opacity="1"
        />
        {/* Halo du laser */}
        <Line
          x1={0}  y1={y}
          x2={SW} y2={y + Math.tan((angle * Math.PI) / 180) * SW}
          stroke={color}
          strokeWidth={thick * 5}
          opacity="0.12"
        />
      </Svg>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFETTIS — tombent depuis le haut en rythme
// ═══════════════════════════════════════════════════════════════════════════════
const N_CONFETTI = 30;
const CONFETTI   = Array.from({ length: N_CONFETTI }, (_, i) => {
  const r = makeRand(i * 2311 + 0xC0FF);
  return {
    id:    i,
    x:     r() * SW,
    size:  4 + r() * 7,
    color: CONFETTI_COLS[Math.floor(r() * CONFETTI_COLS.length)],
    dur:   2500 + r() * 4000,
    delay: r() * 8000,
    sway:  (r() - 0.5) * SW * 0.25,
    rot:   r() * 360,
    shape: r() > 0.5 ? 'square' : 'circle',
  };
});

function Confetto({ x, size, color, dur, delay, sway, rot, shape }) {
  const ty    = useRef(new Animated.Value(-size)).current;
  const tx    = useRef(new Animated.Value(0)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;
  const op    = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(-size); tx.setValue(0); rotAnim.setValue(0); op.setValue(1);
      Animated.parallel([
        Animated.timing(ty,       { toValue: SH + size, duration: dur, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tx,       { toValue: sway,       duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rotAnim,  { toValue: 1,           duration: dur, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1,   duration: dur * 0.7, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: dur * 0.3, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, 300 + Math.random() * 2000));
    };
    const t = setTimeout(run, delay);
    return () => clearTimeout(t);
  }, []);

  const rotateDeg = rotAnim.interpolate({ inputRange: [0, 1], outputRange: [`${rot}deg`, `${rot + 360}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: x,
        width: size, height: shape === 'square' ? size * 0.55 : size,
        borderRadius: shape === 'circle' ? size / 2 : 1,
        backgroundColor: color,
        opacity: op,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateY: ty }, { translateX: tx }, { rotate: rotateDeg }],
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOND — halos colorés pulsants derrière la scène
// ═══════════════════════════════════════════════════════════════════════════════
const BG_HALOS = [
  { x: SW * 0.15, y: SH * 0.25, color: '#ff00ff', dur: 2200 },
  { x: SW * 0.80, y: SH * 0.18, color: '#00ffff', dur: 2800 },
  { x: SW * 0.45, y: SH * 0.40, color: '#ff0066', dur: 1900 },
  { x: SW * 0.70, y: SH * 0.55, color: '#ffff00', dur: 3100 },
  { x: SW * 0.20, y: SH * 0.65, color: '#aa00ff', dur: 2500 },
];

function BgHalo({ x, y, color, dur }) {
  const pulse = useRef(new Animated.Value(0.04)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.13, duration: dur,     useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.04, duration: dur * 1.2, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: x - 110, top: y - 110,
      width: 220, height: 220,
      borderRadius: 110,
      backgroundColor: color,
      opacity: pulse,
    }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGNES DE SCÈNE — délimitent la piste comme un vrai plateau DDR
// ═══════════════════════════════════════════════════════════════════════════════
function StageLines() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  const scroll = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Lignes qui scrollent vers le bas — effet "approche du joueur"
    Animated.loop(
      Animated.timing(scroll, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const LANE_W    = SW / 4;
  const LANE_COLS = ['#00eeff','#ff33cc','#ffaa00','#33ff88'];
  const N_HLINES  = 10;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Séparateurs de couloirs verticaux */}
      {[1, 2, 3].map(i => (
        <Animated.View key={`vl${i}`} style={{
          position: 'absolute',
          top: FLOOR_Y * 0.6,
          left: LANE_W * i - 0.5,
          width: 1,
          height: SH - FLOOR_Y * 0.6,
          backgroundColor: LANE_COLS[i],
          opacity: pulse,
          shadowColor: LANE_COLS[i],
          shadowOpacity: 1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 0 },
        }} />
      ))}

      {/* Lignes horizontales scrollantes — beat */}
      {Array.from({ length: N_HLINES }, (_, i) => {
        const frac   = i / N_HLINES;
        const baseY  = FLOOR_Y + frac * (SH - FLOOR_Y);
        const transY = scroll.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (SH - FLOOR_Y) / N_HLINES],
        });
        return (
          <Animated.View key={`hl${i}`} style={{
            position: 'absolute',
            top: baseY,
            left: 0, right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.12)',
            transform: [{ translateY: transY }],
          }} />
        );
      })}

      {/* Bordures latérales de la piste néon */}
      <Animated.View style={{
        position: 'absolute',
        top: FLOOR_Y * 0.6, left: 0,
        width: 2, height: SH,
        backgroundColor: '#ff33cc',
        opacity: pulse,
        shadowColor: '#ff33cc', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
      }} />
      <Animated.View style={{
        position: 'absolute',
        top: FLOOR_Y * 0.6, right: 0,
        width: 2, height: SH,
        backgroundColor: '#ff33cc',
        opacity: pulse,
        shadowColor: '#ff33cc', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
      }} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function DiscoBackground() {
  return (
    <View style={styles.container}>

      {/* Fond sombre */}
      <View style={styles.bg} />

      {/* Spots / projecteurs */}
      {SPOTS.map(s => <Spot key={s.id} {...s} />)}

      {/* Lasers */}
      {LASERS.map(l => <Laser key={l.id} {...l} />)}

      {/* Sol DDR — tuiles clignotantes */}
      <DanceFloor />

      {/* Lignes de scène et couloirs */}
      <StageLines />

      {/* Boule disco + éclats */}
      <DiscoBall />

      {/* Confettis */}
      {CONFETTI.map(c => <Confetto key={c.id} {...c} />)}

      {/* Voile très léger pour lisibilité */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08000f',
    overflow: 'hidden',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06000c',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 0, 10, 0.15)',
  },
});
