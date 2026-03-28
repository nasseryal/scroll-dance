// ── Jungle Amazonienne Background — forêt profonde scrolling infini ───────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import Svg, {
  Rect, Circle, Ellipse, Path, G, Defs,
  RadialGradient, Stop, LinearGradient,
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

// ── Palette Jungle Amazonienne ────────────────────────────────────────────────
const GREENS = [
  '#0a2e0a', '#0d3d0d', '#0f4a0f', '#134f13',
  '#1a6b1a', '#1f7a1f', '#236b23', '#145214',
];
const LEAF_COLORS = [
  '#1a8c1a', '#22a622', '#17991a', '#0f7a0f',
  '#2db82d', '#19a019', '#0d6e0d', '#33cc33',
  '#145214', '#0a400a',
];
const VINE_COLORS = ['#5c3d1a', '#7a5230', '#6b4423', '#4a2e10'];
const FLOWER_COLORS = ['#ff4444', '#ff6600', '#ffcc00', '#ff0066', '#ff3399'];
const BIRD_COLORS = ['#ff3300', '#ffcc00', '#00aaff', '#ff6600', '#33ff99'];

// ── Constantes layout ─────────────────────────────────────────────────────────
const GROUND_H   = 60;
const CANOPY_H   = SH * 0.45;
const SCROLL_MS  = 28000;
const MIST_MS    = 18000;

// ── Génération arbres ─────────────────────────────────────────────────────────
const N_TREES = 20;
const rand = makeRand(0xA4F7);

const TREES = Array.from({ length: N_TREES }, (_, i) => {
  const r       = makeRand(i * 6271 + 0xF1A3);
  const w       = 55 + Math.floor(r() * 80);
  const h       = SH * 0.55 + r() * SH * 0.35;
  const trunkW  = 14 + Math.floor(r() * 22);
  const trunkH  = h * (0.3 + r() * 0.35);
  const green   = GREENS[Math.floor(r() * GREENS.length)];
  const leafCol = LEAF_COLORS[Math.floor(r() * LEAF_COLORS.length)];
  const leafCol2= LEAF_COLORS[Math.floor(r() * LEAF_COLORS.length)];
  const vine    = VINE_COLORS[Math.floor(r() * VINE_COLORS.length)];
  const nVines  = 2 + Math.floor(r() * 4);
  const hasFlower = r() > 0.6;
  const flower  = FLOWER_COLORS[Math.floor(r() * FLOWER_COLORS.length)];
  const layer   = Math.floor(r() * 3); // 0=bg, 1=mid, 2=fg

  // Lianes
  const vines = Array.from({ length: nVines }, (__, vi) => {
    const vr = makeRand(i * 1234 + vi * 567);
    return {
      x:      vr() * w,
      len:    trunkH * (0.4 + vr() * 0.6),
      sway:   (vr() - 0.5) * 30,
      thick:  1 + vr() * 2,
    };
  });

  // Feuilles de canopée (ellipses)
  const nLeaves = 6 + Math.floor(r() * 8);
  const leaves  = Array.from({ length: nLeaves }, (__, li) => {
    const lr = makeRand(i * 999 + li * 333);
    return {
      cx: w * 0.1 + lr() * w * 0.8,
      cy: -(lr() * h * 0.25),
      rx: 18 + lr() * 35,
      ry: 10 + lr() * 22,
      rot: (lr() - 0.5) * 60,
      col: lr() > 0.5 ? leafCol : leafCol2,
      opacity: 0.75 + lr() * 0.25,
    };
  });

  return { w, h, trunkW, trunkH, green, leafCol, leafCol2, vine, vines, leaves, hasFlower, flower, layer };
});

// Positions X cumulées avec gaps
let cur = 0;
const GAPS = [0, 5, 12, 6, 8, 10, 4, 7, 9, 5, 11, 6, 8, 12, 5, 9, 7, 6, 10, 8];
const OFFSETS = TREES.map((t, i) => {
  const x = cur;
  cur += t.w + GAPS[i % GAPS.length];
  return x;
});
const TOTAL_W = cur;

// ── SVG d'un arbre ────────────────────────────────────────────────────────────
function TreeSet({ svgH }) {
  return (
    <Svg width={TOTAL_W} height={svgH}>
      <Defs>
        {TREES.map((t, idx) => (
          <RadialGradient
            key={`rg${idx}`}
            id={`rg${idx}`}
            cx="50%" cy="40%" r="60%"
          >
            <Stop offset="0%"   stopColor={t.leafCol2} stopOpacity="1" />
            <Stop offset="100%" stopColor={t.leafCol}  stopOpacity="1" />
          </RadialGradient>
        ))}
        <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#0d3d0d" stopOpacity="1" />
          <Stop offset="100%" stopColor="#071a07" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Sol végétal */}
      <Rect x={0} y={svgH - GROUND_H} width={TOTAL_W} height={GROUND_H} fill="url(#groundGrad)" />

      {TREES.map((t, idx) => {
        const bx   = OFFSETS[idx];
        const base = svgH - GROUND_H;
        const top  = base - t.h;
        const tx   = bx + (t.w - t.trunkW) / 2;

        return (
          <G key={idx}>
            {/* Tronc */}
            <Rect
              x={tx} y={base - t.trunkH}
              width={t.trunkW} height={t.trunkH}
              fill={t.vine}
              rx={t.trunkW * 0.25}
            />
            {/* Texture tronc */}
            <Rect
              x={tx + t.trunkW * 0.35} y={base - t.trunkH}
              width={t.trunkW * 0.12} height={t.trunkH}
              fill="rgba(0,0,0,0.18)"
              rx={2}
            />

            {/* Lianes pendantes */}
            {t.vines.map((v, vi) => (
              <Path
                key={vi}
                d={`M ${bx + v.x} ${base - t.trunkH * 0.7} Q ${bx + v.x + v.sway} ${base - t.trunkH * 0.35} ${bx + v.x + v.sway * 0.4} ${base - t.trunkH * 0.7 + v.len}`}
                fill="none"
                stroke={t.vine}
                strokeWidth={v.thick}
                strokeLinecap="round"
                opacity="0.7"
              />
            ))}

            {/* Canopée — feuilles superposées */}
            {t.leaves.map((lf, li) => (
              <Ellipse
                key={li}
                cx={bx + lf.cx}
                cy={top + t.h * 0.1 + lf.cy}
                rx={lf.rx}
                ry={lf.ry}
                fill={lf.col}
                opacity={lf.opacity}
                transform={`rotate(${lf.rot}, ${bx + lf.cx}, ${top + lf.cy})`}
              />
            ))}

            {/* Halo canopée central */}
            <Ellipse
              cx={bx + t.w / 2}
              cy={top + t.h * 0.05}
              rx={t.w * 0.55}
              ry={t.h * 0.18}
              fill={`url(#rg${idx})`}
              opacity="0.88"
            />

            {/* Fleur tropicale */}
            {t.hasFlower && (
              <Circle
                cx={bx + t.w * 0.3 + Math.floor(idx * 7.3) % (t.w * 0.4)}
                cy={top + t.h * 0.08}
                r={5}
                fill={t.flower}
                opacity="0.92"
              />
            )}

            {/* Racines au sol */}
            <Path
              d={`M ${tx} ${base} Q ${tx - 8} ${base - 12} ${tx - 4} ${base - t.trunkH * 0.08}`}
              fill={t.vine} opacity="0.55"
            />
            <Path
              d={`M ${tx + t.trunkW} ${base} Q ${tx + t.trunkW + 8} ${base - 12} ${tx + t.trunkW + 4} ${base - t.trunkH * 0.08}`}
              fill={t.vine} opacity="0.55"
            />
          </G>
        );
      })}
    </Svg>
  );
}

// ── Feuilles tombantes ────────────────────────────────────────────────────────
const N_FALLING = 14;
const FALL_DATA = Array.from({ length: N_FALLING }, (_, i) => {
  const r = makeRand(i * 8191 + 0x2B4A);
  return {
    id:       i,
    startX:   r() * SW,
    size:     8 + r() * 18,
    duration: 5000 + r() * 8000,
    delay:    r() * 12000,
    sway:     (r() - 0.5) * SW * 0.4,
    color:    LEAF_COLORS[Math.floor(r() * LEAF_COLORS.length)],
    rotEnd:   180 + r() * 360,
    opacity:  0.55 + r() * 0.45,
  };
});

function FallingLeaf({ startX, size, duration, delay, sway, color, rotEnd, opacity }) {
  const ty  = useRef(new Animated.Value(-size)).current;
  const tx  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(-size);
      tx.setValue(0);
      rot.setValue(0);
      op.setValue(opacity);

      Animated.parallel([
        Animated.timing(ty,  { toValue: SH + size, duration, easing: Easing.linear,  useNativeDriver: true }),
        Animated.timing(tx,  { toValue: sway,       duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1,           duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: opacity, duration: duration * 0.1, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,        duration: duration * 0.9, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, 500 + Math.random() * 3000));
    };

    const t = setTimeout(run, delay);
    return () => clearTimeout(t);
  }, []);

  const rotateDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${rotEnd}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: startX,
        width: size, height: size * 0.55,
        borderRadius: size * 0.5,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: ty }, { translateX: tx }, { rotate: rotateDeg }],
      }}
    />
  );
}

// ── Brume tropicale ───────────────────────────────────────────────────────────
function MistLayer({ yFrac, opacity, speed }) {
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, {
        toValue: -SW,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: SH * yFrac,
        left: 0,
        width: SW * 2,
        height: 40 + opacity * 30,
        backgroundColor: 'rgba(180, 255, 180, 0.055)',
        borderRadius: 20,
        opacity,
        transform: [{ translateX: tx }],
      }}
    />
  );
}

// ── Rayon de lumière solaire ──────────────────────────────────────────────────
function SunRay({ x, angle, opacity }) {
  const pulse = useRef(new Animated.Value(opacity * 0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: opacity,       duration: 2500 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: opacity * 0.4, duration: 2500 + Math.random() * 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: x,
        width: 28,
        height: SH * 0.7,
        backgroundColor: 'rgba(180, 255, 120, 0.07)',
        opacity: pulse,
        transform: [{ rotate: `${angle}deg` }, { translateX: -14 }],
        transformOrigin: 'top center',
      }}
    />
  );
}

// ── Oiseaux tropicaux ─────────────────────────────────────────────────────────
const BIRD_DATA = Array.from({ length: 5 }, (_, i) => {
  const r = makeRand(i * 3571 + 0x9C2E);
  return {
    id:       i,
    y:        SH * (0.08 + r() * 0.28),
    duration: 7000 + r() * 9000,
    delay:    r() * 15000,
    size:     7 + r() * 9,
    color:    BIRD_COLORS[Math.floor(r() * BIRD_COLORS.length)],
    dirRight: r() > 0.5,
  };
});

function TropicalBird({ y, duration, delay, size, color, dirRight }) {
  const tx   = useRef(new Animated.Value(dirRight ? -size * 3 : SW + size)).current;
  const wing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(tx, {
          toValue: dirRight ? SW + size * 3 : -size * 3,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(2000 + Math.random() * 5000),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wing, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(wing, { toValue: 0, duration: 260, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const wingRot = wing.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '30deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        transform: [{ translateX: tx }, { scaleX: dirRight ? 1 : -1 }],
      }}
    >
      {/* Corps */}
      <View style={{
        width: size * 1.8, height: size * 0.7,
        borderRadius: size * 0.35,
        backgroundColor: color,
        position: 'absolute',
        top: size * 0.15,
      }} />
      {/* Aile haute */}
      <Animated.View style={{
        width: size * 1.2, height: size * 0.5,
        borderRadius: size * 0.25,
        backgroundColor: color,
        position: 'absolute',
        top: 0, left: size * 0.3,
        opacity: 0.8,
        transform: [{ rotate: wingRot }],
        transformOrigin: 'left center',
      }} />
    </Animated.View>
  );
}

// ── Lucioles ──────────────────────────────────────────────────────────────────
const FIREFLIES = Array.from({ length: 18 }, (_, i) => {
  const r = makeRand(i * 2311 + 0x6E4C);
  return {
    id:    i,
    x:     r() * SW,
    y:     SH * (0.3 + r() * 0.6),
    dur:   800 + r() * 1400,
    delay: r() * 6000,
    size:  2 + r() * 3,
  };
});

function Firefly({ x, y, dur, delay, size }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(op, { toValue: 0.9, duration: dur * 0.4, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: dur * 0.6, useNativeDriver: true }),
          ]),
          Animated.timing(ty, { toValue: -8 - Math.random() * 12, duration: dur, useNativeDriver: true }),
          Animated.timing(tx, { toValue: (Math.random() - 0.5) * 20, duration: dur, useNativeDriver: true }),
        ]),
        Animated.timing(ty, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(tx, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(500 + Math.random() * 2000),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x, top: y,
        width: size, height: size,
        borderRadius: size / 2,
        backgroundColor: '#aaff44',
        opacity: op,
        shadowColor: '#aaff44',
        shadowOpacity: 1,
        shadowRadius: size * 2,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateX: tx }, { translateY: ty }],
      }}
    />
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function JungleBackground() {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -TOTAL_W,
        duration: SCROLL_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const svgH = SH - GROUND_H + 20;

  return (
    <View style={styles.container}>

      {/* Ciel de jungle — vert sombre profond */}
      <View style={styles.sky} />
      <View style={styles.skyMid} />
      <View style={styles.skyBottom} />

      {/* Rayons de lumière solaire filtrés */}
      {[0.12, 0.28, 0.44, 0.62, 0.78].map((xFrac, i) => (
        <SunRay
          key={i}
          x={SW * xFrac}
          angle={-8 + i * 4}
          opacity={0.06 + i % 3 * 0.03}
        />
      ))}

      {/* Arbres scrollants — 2 copies pour boucle infinie */}
      <Animated.View style={[styles.treeRow, { transform: [{ translateX: scrollX }] }]}>
        <TreeSet svgH={svgH} />
        <TreeSet svgH={svgH} />
      </Animated.View>

      {/* Brumes tropicales à différentes hauteurs */}
      <MistLayer yFrac={0.45} opacity={0.55} speed={22000} />
      <MistLayer yFrac={0.62} opacity={0.4}  speed={31000} />
      <MistLayer yFrac={0.78} opacity={0.65} speed={18000} />

      {/* Sol herbeux */}
      <View style={styles.ground}>
        <View style={styles.groundGrass} />
        <View style={styles.groundDark} />
      </View>

      {/* Feuilles tombantes */}
      {FALL_DATA.map(f => <FallingLeaf key={f.id} {...f} />)}

      {/* Oiseaux tropicaux */}
      {BIRD_DATA.map(b => <TropicalBird key={b.id} {...b} />)}

      {/* Lucioles */}
      {FIREFLIES.map(f => <Firefly key={f.id} {...f} />)}

      {/* Voile sombre en overlay pour lisibilité du jeu */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#04180a',
    overflow: 'hidden',
  },
  sky: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: SH * 0.45,
    backgroundColor: '#061a08',
  },
  skyMid: {
    position: 'absolute',
    top: SH * 0.25, left: 0, right: 0,
    height: SH * 0.35,
    backgroundColor: '#082210',
    opacity: 0.7,
  },
  skyBottom: {
    position: 'absolute',
    top: SH * 0.5, left: 0, right: 0,
    height: SH * 0.5,
    backgroundColor: '#041208',
    opacity: 0.8,
  },
  treeRow: {
    position: 'absolute',
    bottom: GROUND_H,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ground: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: GROUND_H,
    backgroundColor: '#061a06',
  },
  groundGrass: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 4,
    backgroundColor: '#1a6b1a',
    opacity: 0.9,
  },
  groundDark: {
    position: 'absolute',
    top: 4, left: 0, right: 0,
    height: GROUND_H - 4,
    backgroundColor: '#030e03',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 10, 3, 0.22)',
  },
});
