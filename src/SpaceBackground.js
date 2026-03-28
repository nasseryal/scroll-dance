// ── Space Background — cosmos profond scrolling infini ────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import Svg, {
  Circle, Ellipse, Path, G, Defs,
  RadialGradient, LinearGradient, Stop, Rect,
} from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// ── LCG seeded ────────────────────────────────────────────────────────────────
function makeRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Palettes ──────────────────────────────────────────────────────────────────
const NEBULA_COLORS = [
  'rgba(100,0,180,', 'rgba(0,80,200,',  'rgba(180,0,100,',
  'rgba(0,160,180,', 'rgba(80,0,160,',  'rgba(200,60,0,',
  'rgba(0,100,160,', 'rgba(120,0,200,',
];
const STAR_COLORS   = ['#ffffff', '#cce8ff', '#ffeebb', '#ffccee', '#aaffff', '#ffaaff'];
const PLANET_DEFS   = [
  { color: '#00F5FF', glow: '#00cfdf', size: 34, ring: true,  ringColor: 'rgba(0,220,255,0.35)'  },
  { color: '#FF4488', glow: '#cc1155', size: 28, ring: false, ringColor: null                    },
  { color: '#aa44ff', glow: '#7700cc', size: 42, ring: true,  ringColor: 'rgba(160,80,255,0.3)'  },
  { color: '#ff8800', glow: '#cc5500', size: 22, ring: false, ringColor: null                    },
  { color: '#33ffaa', glow: '#00cc77', size: 18, ring: false, ringColor: null                    },
];
const ASTEROID_COLORS = ['#7a7888','#6e6a7a','#8a8070','#5a5868','#9a8878','#6a6070'];
const COMET_COLORS    = ['#ffffff','#cce8ff','#aaffff','#ffeebb'];

// ── Constantes ────────────────────────────────────────────────────────────────
const SCROLL_MS   = 32000;   // durée boucle principale (corps célestes)
const STAR_MS_FG  = 16000;   // plan rapide
const STAR_MS_BG  = 48000;   // plan lent

// ═══════════════════════════════════════════════════════════════════════════════
// CHAMP D'ÉTOILES — 3 plans de parallaxe
// ═══════════════════════════════════════════════════════════════════════════════
const makeStar = (i, seed, yMax) => {
  const r = makeRand(seed);
  return {
    id: i, x: r() * SW * 2, y: r() * yMax,
    size: r() * 2.5 + 0.4,
    durOn:  500  + r() * 2200,
    durOff: 300  + r() * 1600,
    delay:  r() * 5000,
    maxOp:  0.3 + r() * 0.7,
    color:  STAR_COLORS[Math.floor(r() * STAR_COLORS.length)],
  };
};

const STARS_BG  = Array.from({ length: 120 }, (_, i) => makeStar(i, i * 7919 + 11111, SH));
const STARS_MID = Array.from({ length: 60  }, (_, i) => makeStar(i, i * 4447 + 22222, SH));
const STARS_FG  = Array.from({ length: 30  }, (_, i) => makeStar(i, i * 3571 + 33333, SH));

function Star({ x, y, size, durOn, durOff, delay, maxOp, color }) {
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: maxOp, duration: durOn,  useNativeDriver: true }),
        Animated.timing(op, { toValue: 0,     duration: durOff, useNativeDriver: true }),
        Animated.delay(200 + Math.random() * 600),
      ])
    ).start();
  }, []);

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: op,
      shadowColor: color, shadowOpacity: 0.9,
      shadowRadius: size * 2, shadowOffset: { width: 0, height: 0 },
    }} />
  );
}

function StarLayer({ stars, scrollMs }) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, {
        toValue: -SW,
        duration: scrollMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx }] }]}
    >
      {stars.map(s => <Star key={s.id} {...s} />)}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NÉBULEUSES — formes gazeuses translucides scrollantes
// ═══════════════════════════════════════════════════════════════════════════════
const N_NEBULAE = 8;
const NEBULAE   = Array.from({ length: N_NEBULAE }, (_, i) => {
  const r  = makeRand(i * 5003 + 0xBEEF);
  const nc = NEBULA_COLORS[Math.floor(r() * NEBULA_COLORS.length)];
  return {
    id: i,
    x:  r() * SW * 2,
    y:  r() * SH * 0.85,
    rx: 60 + r() * 130,
    ry: 30 + r() * 80,
    op: 0.08 + r() * 0.13,
    color: nc,
    rot: r() * 360,
  };
});

const NEBULAE2 = Array.from({ length: 6 }, (_, i) => {
  const r  = makeRand(i * 6661 + 0xCAFE);
  const nc = NEBULA_COLORS[Math.floor(r() * NEBULA_COLORS.length)];
  return {
    id: i + 100,
    x:  r() * SW * 2,
    y:  r() * SH,
    rx: 40 + r() * 90,
    ry: 20 + r() * 50,
    op: 0.06 + r() * 0.10,
    color: nc,
    rot: r() * 360,
  };
});

function NebulaLayer({ nebulae, scrollMs }) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, {
        toValue: -SW,
        duration: scrollMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx }] }]}
    >
      {nebulae.map(n => (
        <View
          key={n.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: n.x - n.rx,
            top: n.y - n.ry,
            width: n.rx * 2,
            height: n.ry * 2,
            borderRadius: n.rx,
            backgroundColor: `${n.color}${Math.round(n.op * 255).toString(16).padStart(2,'0')})`,
            transform: [{ rotate: `${n.rot}deg` }],
          }}
        />
      ))}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORPS CÉLESTES SCROLLANTS — planètes + astéroïdes via SVG
// ═══════════════════════════════════════════════════════════════════════════════
const N_PLANETS   = 5;
const N_ASTEROIDS = 18;

const rand = makeRand(0xD34D);

// Positions planètes
const PLANET_DATA = Array.from({ length: N_PLANETS }, (_, i) => {
  const r   = makeRand(i * 9001 + 0x1234);
  const def = PLANET_DEFS[i % PLANET_DEFS.length];
  return {
    ...def,
    id: i,
    x:    SW * 0.3 + r() * SW * 1.6,
    y:    SH * 0.05 + r() * SH * 0.7,
    tilt: (r() - 0.5) * 40,
  };
});

// Positions astéroïdes (champ)
const ASTEROID_DATA = Array.from({ length: N_ASTEROIDS }, (_, i) => {
  const r    = makeRand(i * 8191 + 0xABCD);
  const size = 5 + r() * 22;
  return {
    id: i, size,
    x:  r() * SW * 2,
    y:  SH * 0.05 + r() * SH * 0.85,
    br1: size * (0.2 + r() * 0.5),
    br2: size * (0.1 + r() * 0.6),
    br3: size * (0.3 + r() * 0.4),
    br4: size * (0.15 + r() * 0.55),
    color: ASTEROID_COLORS[Math.floor(r() * ASTEROID_COLORS.length)],
    op: 0.5 + r() * 0.5,
    crater: r() > 0.4,
  };
});

const TOTAL_SCENE_W = SW * 2;

function SceneLayer() {
  return (
    <Svg width={TOTAL_SCENE_W} height={SH}>
      <Defs>
        {PLANET_DATA.map((p, i) => (
          <RadialGradient key={`pg${i}`} id={`pg${i}`} cx="35%" cy="30%" r="65%">
            <Stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35" />
            <Stop offset="40%"  stopColor={p.color}  stopOpacity="1"   />
            <Stop offset="100%" stopColor={p.glow}   stopOpacity="1"   />
          </RadialGradient>
        ))}
      </Defs>

      {/* ── Champ d'astéroïdes ── */}
      {ASTEROID_DATA.map((a, i) => (
        <G key={`ast${i}`}>
          <Rect
            x={a.x - a.size / 2} y={a.y - a.size * 0.36}
            width={a.size} height={a.size * 0.72}
            fill={a.color} opacity={a.op}
            rx={a.br1} ry={a.br2}
          />
          {a.crater && (
            <Circle
              cx={a.x - a.size * 0.08} cy={a.y - a.size * 0.08}
              r={a.size * 0.18}
              fill="rgba(0,0,0,0.28)"
            />
          )}
        </G>
      ))}

      {/* ── Planètes ── */}
      {PLANET_DATA.map((p, i) => (
        <G key={`pl${i}`}>
          {/* Halo externe */}
          <Circle
            cx={p.x} cy={p.y}
            r={p.size * 1.9}
            fill={p.glow} opacity="0.08"
          />
          <Circle
            cx={p.x} cy={p.y}
            r={p.size * 1.4}
            fill={p.glow} opacity="0.12"
          />

          {/* Anneau si applicable — derrière la planète */}
          {p.ring && (
            <Ellipse
              cx={p.x} cy={p.y + p.size * 0.15}
              rx={p.size * 2.1} ry={p.size * 0.45}
              fill="none"
              stroke={p.ringColor}
              strokeWidth={p.size * 0.32}
              opacity="0.5"
              transform={`rotate(${p.tilt}, ${p.x}, ${p.y})`}
            />
          )}

          {/* Corps planète */}
          <Circle
            cx={p.x} cy={p.y}
            r={p.size}
            fill={`url(#pg${i})`}
          />

          {/* Reflet */}
          <Circle
            cx={p.x - p.size * 0.25} cy={p.y - p.size * 0.28}
            r={p.size * 0.28}
            fill="rgba(255,255,255,0.18)"
          />

          {/* Anneau devant */}
          {p.ring && (
            <Ellipse
              cx={p.x} cy={p.y + p.size * 0.15}
              rx={p.size * 2.1} ry={p.size * 0.45}
              fill="none"
              stroke={p.ringColor}
              strokeWidth={p.size * 0.18}
              opacity="0.65"
              transform={`rotate(${p.tilt}, ${p.x}, ${p.y})`}
            />
          )}
        </G>
      ))}
    </Svg>
  );
}

function ScrollingScene() {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, {
        toValue: -TOTAL_SCENE_W,
        duration: SCROLL_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { flexDirection: 'row', transform: [{ translateX: tx }] },
      ]}
    >
      <SceneLayer />
      <SceneLayer />
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTOILES FILANTES / COMÈTES
// ═══════════════════════════════════════════════════════════════════════════════
const COMETS = Array.from({ length: 6 }, (_, i) => {
  const r = makeRand(i * 6661 + 0x77AA);
  return {
    id:       i,
    startX:   r() * SW * 0.8,
    startY:   r() * SH * 0.45,
    length:   55 + r() * 110,
    duration: 420 + r() * 500,
    interval: 3500 + r() * 10000,
    delay:    r() * 14000,
    angle:    22 + r() * 28,
    color:    COMET_COLORS[Math.floor(r() * COMET_COLORS.length)],
    thick:    1 + r() * 1.5,
  };
});

function Comet({ startX, startY, length, duration, interval, delay, angle, color, thick }) {
  const prog = useRef(new Animated.Value(0)).current;
  const op   = useRef(new Animated.Value(0)).current;

  const rad = (angle * Math.PI) / 180;
  const dx  = Math.cos(rad) * length;
  const dy  = Math.sin(rad) * length;

  useEffect(() => {
    const shoot = () => {
      prog.setValue(0); op.setValue(0);
      Animated.parallel([
        Animated.timing(prog, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: duration * 0.12, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: duration * 0.88, useNativeDriver: true }),
        ]),
      ]).start();
    };

    const loop = () => {
      shoot();
      return setTimeout(loop, interval + Math.random() * 6000);
    };
    const t = setTimeout(loop, delay);
    return () => clearTimeout(t);
  }, []);

  const translateX = prog.interpolate({ inputRange: [0,1], outputRange: [0, dx] });
  const translateY = prog.interpolate({ inputRange: [0,1], outputRange: [0, dy] });

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      top: startY, left: startX,
      width: length, height: thick + 1,
      opacity: op,
      transform: [{ translateX }, { translateY }, { rotate: `${angle}deg` }],
    }}>
      <View style={{ position: 'absolute', right: 0, width: length * 0.14, height: thick + 1, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: length * 0.11, width: length * 0.3, height: thick, backgroundColor: color, opacity: 0.55, borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: length * 0.35, width: length * 0.65, height: thick * 0.6, backgroundColor: color, opacity: 0.18, borderRadius: 1 }} />
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASTÉROÏDES TRAVERSANTS — volent de gauche à droite ou l'inverse
// ═══════════════════════════════════════════════════════════════════════════════
const FLYING_ASTEROIDS = Array.from({ length: 7 }, (_, i) => {
  const r    = makeRand(i * 3571 + 0x5E7A);
  const size = 6 + r() * 20;
  return {
    id:       i,
    size,
    y:        SH * (0.04 + r() * 0.85),
    duration: 10000 + r() * 20000,
    delay:    r() * 12000,
    rotDur:   3000  + r() * 10000,
    br1:      size * (0.25 + r() * 0.45),
    br2:      size * (0.15 + r() * 0.55),
    br3:      size * (0.35 + r() * 0.40),
    br4:      size * (0.10 + r() * 0.60),
    color:    ASTEROID_COLORS[Math.floor(r() * ASTEROID_COLORS.length)],
    opacity:  0.5 + r() * 0.45,
    dirRight: r() > 0.5,
    crater:   r() > 0.5,
  };
});

function FlyingAsteroid({ size, y, duration, delay, rotDur, br1, br2, br3, br4, color, opacity, dirRight, crater }) {
  const tx  = useRef(new Animated.Value(dirRight ? -size * 2 : SW + size)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(tx, {
          toValue: dirRight ? SW + size * 2 : -size * 2,
          duration, easing: Easing.linear, useNativeDriver: true,
        }),
        Animated.delay(1000 + Math.random() * 4000),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: rotDur, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      top: y, left: 0,
      width: size, height: size * 0.72,
      backgroundColor: color,
      borderTopLeftRadius: br1, borderTopRightRadius: br2,
      borderBottomLeftRadius: br3, borderBottomRightRadius: br4,
      opacity,
      shadowColor: '#aaaacc', shadowOpacity: 0.35,
      shadowRadius: size * 0.4, shadowOffset: { width: -2, height: 2 },
      transform: [{ translateX: tx }, { rotate }],
    }}>
      {crater && (
        <View style={{
          position: 'absolute',
          top: size * 0.15, left: size * 0.2,
          width: size * 0.26, height: size * 0.2,
          borderRadius: size * 0.13,
          backgroundColor: 'rgba(0,0,0,0.28)',
        }} />
      )}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PULSAR / ÉTOILE À NEUTRONS — clignote au centre
// ═══════════════════════════════════════════════════════════════════════════════
function Pulsar() {
  const pulse = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1,   duration: 120, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 0,   duration: 200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(2800 + Math.random() * 2000),
      ])
    ).start();
  }, []);

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      top: SH * 0.18, right: SW * 0.12,
      width: 10, height: 10,
      borderRadius: 5,
      backgroundColor: '#ffffff',
      opacity: pulse,
      transform: [{ scale }],
      shadowColor: '#aaffff', shadowOpacity: 1,
      shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
    }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRILLE TRON (sol perspective) — repris et enrichi
// ═══════════════════════════════════════════════════════════════════════════════
const HORIZON_Y  = SH * 0.78;
const VANISH_X   = SW / 2;
const TRON_DIM   = 'rgba(0, 238, 255, 0.12)';
const TRON_VIVID = 'rgba(0, 238, 255, 0.38)';

const V_LINES = [-SW * 0.46, -SW * 0.3, -SW * 0.17, -SW * 0.07, 0, SW * 0.07, SW * 0.17, SW * 0.3, SW * 0.46];
const H_FRACS = [0.06, 0.14, 0.24, 0.36, 0.52, 0.70, 0.88, 1.0];

function TronGrid() {
  const pulse = useRef(new Animated.Value(0.65)).current;
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,    duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.65, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Léger mouvement horizontal subtil
    Animated.loop(
      Animated.sequence([
        Animated.timing(shift, { toValue: 6,  duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(shift, { toValue: -6, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const gridH = SH - HORIZON_Y;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: pulse }]}>
      {/* Sol sombre */}
      <View style={{
        position: 'absolute', left: 0, right: 0,
        top: HORIZON_Y, bottom: 0,
        backgroundColor: 'rgba(0, 5, 25, 0.85)',
      }} />

      {/* Lignes verticales en perspective */}
      {V_LINES.map((offset, i) => {
        const central = i === Math.floor(V_LINES.length / 2);
        const ang = Math.atan2(gridH, offset) * (180 / Math.PI) - 90;
        const len = Math.sqrt(offset * offset + gridH * gridH);
        return (
          <Animated.View key={`v${i}`} style={{
            position: 'absolute',
            left: VANISH_X, top: HORIZON_Y,
            width: central ? 2 : 1,
            height: len,
            backgroundColor: central ? TRON_VIVID : TRON_DIM,
            transform: [{ rotate: `${ang}deg` }, { translateX: shift }],
          }} />
        );
      })}

      {/* Lignes horizontales */}
      {H_FRACS.map((frac, i) => {
        const y      = HORIZON_Y + frac * gridH;
        const spread = frac * SW * 0.52;
        const last   = i === H_FRACS.length - 1;
        return (
          <View key={`h${i}`} style={{
            position: 'absolute', top: y,
            left: VANISH_X - spread, width: spread * 2,
            height: last ? 2 : 1,
            backgroundColor: last ? TRON_VIVID : TRON_DIM,
          }} />
        );
      })}

      {/* Ligne d'horizon */}
      <View style={{
        position: 'absolute', top: HORIZON_Y,
        left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(0,238,255,0.6)',
        shadowColor: '#00eeff', shadowOpacity: 1,
        shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
      }} />
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function SpaceBackground() {
  return (
    <View style={styles.container}>

      {/* Fond espace très sombre */}
      <View style={styles.sky} />
      <View style={styles.skyGlow} />

      {/* Nébuleuses plan lointain */}
      <NebulaLayer nebulae={NEBULAE}  scrollMs={STAR_MS_BG * 1.4} />
      <NebulaLayer nebulae={NEBULAE2} scrollMs={STAR_MS_BG * 0.9} />

      {/* Étoiles — 3 plans de parallaxe */}
      <StarLayer stars={STARS_BG}  scrollMs={STAR_MS_BG} />
      <StarLayer stars={STARS_MID} scrollMs={STAR_MS_BG * 0.6} />
      <StarLayer stars={STARS_FG}  scrollMs={STAR_MS_FG} />

      {/* Planètes + champ d'astéroïdes scrollants */}
      <ScrollingScene />

      {/* Astéroïdes traversant l'écran */}
      {FLYING_ASTEROIDS.map(a => <FlyingAsteroid key={a.id} {...a} />)}

      {/* Comètes / étoiles filantes */}
      {COMETS.map(c => <Comet key={c.id} {...c} />)}

      {/* Pulsar */}
      <Pulsar />

      {/* Grille Tron au sol */}
      <TronGrid />

      {/* Voile sombre léger pour lisibilité */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020010',
    overflow: 'hidden',
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#03000f',
  },
  skyGlow: {
    position: 'absolute',
    top: SH * 0.1, left: SW * 0.2,
    width: SW * 0.6, height: SH * 0.3,
    borderRadius: SW * 0.3,
    backgroundColor: 'rgba(80,0,160,0.07)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1,0,12,0.18)',
  },
});
