// ── City Cyberpunk Background — immeubles scrolling infini ────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import Svg, { Rect, Circle, Ellipse, Line, G, Path } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// ── LCG seeded ────────────────────────────────────────────────────────────────
function makeRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ── Données générées une seule fois ──────────────────────────────────────────
const GROUND_H  = 72;
const MAX_BH    = SH * 0.78;
const SCROLL_MS = 22000; // durée d'un cycle complet

const NEONS = ['#ff00ff','#00ffff','#ff0066','#00ff88','#cc00ff','#ffff00','#ff8800','#ff3399','#00ccff','#aaff00'];
const WALLS = ['#0d0520','#0a0416','#111030','#0c0a20','#14102a','#0e0728','#08061a'];
const WIN_C = ['#fff8aa','#ffeebb','#aaffff','#ffaaff','#88ffcc','#ffffff'];

const rand = makeRand(0xC175);

const N_BUILDINGS = 24;
const BUILDINGS = Array.from({ length: N_BUILDINGS }, (_, i) => {
  const w        = 36 + Math.floor(rand() * 54);    // 36–90 px
  const h        = 90 + Math.floor(rand() * (MAX_BH - 90)); // 90–MAX_BH
  const neon     = NEONS[Math.floor(rand() * NEONS.length)];
  const neon2    = NEONS[Math.floor(rand() * NEONS.length)];
  const wall     = WALLS[Math.floor(rand() * WALLS.length)];
  const winW     = 5 + Math.floor(rand() * 5);      // 5–10
  const winH     = 5 + Math.floor(rand() * 5);      // 5–10
  const winGapX  = 4 + Math.floor(rand() * 4);
  const winGapY  = 6 + Math.floor(rand() * 5);
  const winCols  = Math.max(1, Math.floor((w - 10) / (winW + winGapX)));
  const winRows  = Math.max(1, Math.floor((h - 18) / (winH + winGapY)));
  const hasSign  = rand() > 0.5;
  const signY    = 0.15 + rand() * 0.5;
  const antenna  = rand() > 0.45;
  const antH     = 12 + rand() * 18;
  const hasSat   = rand() > 0.75;

  // Windows : lit ou éteint + couleur
  const winRand = makeRand(i * 7919 + 13);
  const windows = Array.from({ length: winRows }, () =>
    Array.from({ length: winCols }, () => ({
      lit: winRand() > 0.62,
      col: WIN_C[Math.floor(winRand() * WIN_C.length)],
    }))
  );

  return { w, h, neon, neon2, wall, winW, winH, winGapX, winGapY, winCols, winRows,
           windows, hasSign, signY, antenna, antH, hasSat };
});

// Positions X cumulées
const GAP = 5;
let cur = 0;
const OFFSETS = BUILDINGS.map(b => { const x = cur; cur += b.w + GAP; return x; });
const TOTAL_W = cur;

// ── Bâtiment SVG ─────────────────────────────────────────────────────────────
function BuildingSet({ svgH }) {
  return (
    <Svg width={TOTAL_W} height={svgH}>
      {BUILDINGS.map((b, idx) => {
        const bx = OFFSETS[idx];
        const by = svgH - b.h;

        return (
          <G key={idx}>
            {/* Corps */}
            <Rect x={bx} y={by} width={b.w} height={b.h} fill={b.wall} />

            {/* Liseré néon toit */}
            <Rect x={bx} y={by} width={b.w} height={2.5} fill={b.neon} opacity="0.95" />
            <Rect x={bx - 1} y={by - 1} width={b.w + 2} height={5} fill={b.neon} opacity="0.18" rx="1" />

            {/* Fenêtres */}
            {b.windows.map((row, ri) =>
              row.map((win, ci) => {
                if (!win.lit) return null;
                const wx = bx + 5 + ci * (b.winW + b.winGapX);
                const wy = by + 12 + ri * (b.winH + b.winGapY);
                if (wx + b.winW > bx + b.w - 4) return null;
                if (wy + b.winH > by + b.h - 4) return null;
                return (
                  <Rect key={`${ri}-${ci}`}
                    x={wx} y={wy} width={b.winW} height={b.winH}
                    fill={win.col} opacity="0.82" rx="0.5"
                  />
                );
              })
            )}

            {/* Enseigne néon */}
            {b.hasSign && (
              <G>
                <Rect
                  x={bx + b.w * 0.1} y={by + b.h * b.signY}
                  width={b.w * 0.8} height={9} rx="2"
                  fill={b.neon2} opacity="0.75"
                />
                <Rect
                  x={bx + b.w * 0.08} y={by + b.h * b.signY - 2}
                  width={b.w * 0.84} height={13} rx="3"
                  fill={b.neon2} opacity="0.12"
                />
              </G>
            )}

            {/* Antenne */}
            {b.antenna && (
              <G>
                <Line
                  x1={bx + b.w / 2} y1={by}
                  x2={bx + b.w / 2} y2={by - b.antH}
                  stroke={b.neon} strokeWidth="1.4"
                />
                <Circle cx={bx + b.w / 2} cy={by - b.antH} r="2.5" fill={b.neon} opacity="0.9" />
                <Circle cx={bx + b.w / 2} cy={by - b.antH} r="4.5" fill={b.neon} opacity="0.2" />
                {/* antenne satellite */}
                {b.hasSat && (
                  <Ellipse
                    cx={bx + b.w / 2 + 5} cy={by - b.antH * 0.4}
                    rx="5" ry="3"
                    fill="none" stroke={b.neon} strokeWidth="1"
                    opacity="0.7"
                    transform={`rotate(-30 ${bx + b.w / 2 + 5} ${by - b.antH * 0.4})`}
                  />
                )}
              </G>
            )}

            {/* Liseré vertical gauche (détail archi) */}
            <Rect x={bx} y={by} width={1.5} height={b.h} fill={b.neon} opacity="0.12" />
            <Rect x={bx + b.w - 1.5} y={by} width={1.5} height={b.h} fill={b.neon} opacity="0.12" />
          </G>
        );
      })}
    </Svg>
  );
}

// ── Lune néon ─────────────────────────────────────────────────────────────────
function NeonMoon() {
  const pulse = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 2800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.7, duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[styles.moonWrap, { opacity: pulse }]}>
      <View style={styles.moonGlow3} />
      <View style={styles.moonGlow2} />
      <View style={styles.moonGlow1} />
      <View style={styles.moon} />
    </Animated.View>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function CityBackground() {
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

  const svgH = MAX_BH + 10;

  return (
    <View style={styles.container}>
      {/* Ciel gradient */}
      <View style={styles.skyTop} />
      <View style={styles.skyMid} />

      {/* Halos colorés lointains */}
      <View style={[styles.farGlow, { left: SW * 0.15, backgroundColor: '#cc00ff' }]} />
      <View style={[styles.farGlow, { left: SW * 0.6,  backgroundColor: '#00ccff' }]} />
      <View style={[styles.farGlow, { left: SW * 0.82, backgroundColor: '#ff0066', width: 100, height: 100 }]} />

      {/* Lune */}
      <NeonMoon />

      {/* Immeubles scrollants — 2 copies pour boucle infinie */}
      <Animated.View style={[styles.buildingRow, { transform: [{ translateX: scrollX }] }]}>
        <BuildingSet svgH={svgH} />
        <BuildingSet svgH={svgH} />
      </Animated.View>

      {/* Sol */}
      <View style={styles.ground}>
        <View style={styles.groundLine} />
        <View style={styles.groundLineSoft} />
        {/* Marquage au sol néon */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.roadMark, { left: (i / 12) * SW * 1.1 - 20 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050010',
    overflow: 'hidden',
  },
  skyTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: SH * 0.55,
    backgroundColor: '#070018',
  },
  skyMid: {
    position: 'absolute',
    top: SH * 0.3, left: 0, right: 0,
    height: SH * 0.4,
    backgroundColor: '#0a0020',
    opacity: 0.6,
  },
  farGlow: {
    position: 'absolute',
    top: SH * 0.1,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.07,
  },
  moonWrap: {
    position: 'absolute',
    top: SH * 0.06,
    right: SW * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffe8ff',
    position: 'absolute',
  },
  moonGlow1: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ff88ff',
    opacity: 0.22,
  },
  moonGlow2: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#cc44ff',
    opacity: 0.1,
  },
  moonGlow3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8800cc',
    opacity: 0.06,
  },
  buildingRow: {
    position: 'absolute',
    bottom: GROUND_H,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_H,
    backgroundColor: '#08000f',
  },
  groundLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#cc00ff',
    opacity: 0.85,
  },
  groundLineSoft: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#cc00ff',
    opacity: 0.1,
  },
  roadMark: {
    position: 'absolute',
    bottom: 18,
    width: 28,
    height: 3,
    backgroundColor: '#440066',
    borderRadius: 1,
  },
});
