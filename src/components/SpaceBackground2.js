// ── Espace 2 — Nébuleuse + planète géante + comètes + parallaxe ──────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

function makeRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ── Étoiles parallaxe (3 couches de vitesse) ─────────────────────────────────
const STAR_LAYERS = [
  { n: 80,  speed: 35000, size: [0.8, 1.4], opacity: [0.3, 0.6]  }, // loin
  { n: 50,  speed: 20000, size: [1.2, 2.2], opacity: [0.5, 0.85] }, // milieu
  { n: 25,  speed: 11000, size: [1.8, 3.2], opacity: [0.7, 1.0]  }, // proche
];

const STAR_DATA = STAR_LAYERS.map((layer, li) =>
  Array.from({ length: layer.n }, (_, i) => {
    const r = makeRand(li * 10000 + i * 317 + 44444);
    return {
      id: `${li}-${i}`,
      layer: li,
      x:   r() * SW,
      y:   r() * SH,
      size: layer.size[0] + r() * (layer.size[1] - layer.size[0]),
      op:   layer.opacity[0] + r() * (layer.opacity[1] - layer.opacity[0]),
      blinkDur: 1200 + r() * 3000,
      blinkDel: r() * 5000,
      color: ['#ffffff','#cce8ff','#ffeebb','#ffccff','#aaffff'][Math.floor(r() * 5)],
    };
  })
);

function StarLayer({ stars, speed }) {
  const tx = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(tx, { toValue: -SW, duration: speed, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx }] }]} pointerEvents="none">
      {/* Double largeur pour boucle infinie */}
      {[0, 1].map(copy => stars.map(s => (
        <Animated.View key={`${copy}-${s.id}`} style={{
          position: 'absolute',
          left: s.x + copy * SW,
          top:  s.y,
          width: s.size, height: s.size,
          borderRadius: s.size / 2,
          backgroundColor: s.color,
          opacity: s.op,
          shadowColor: s.color,
          shadowOpacity: 0.6,
          shadowRadius: s.size,
          shadowOffset: { width: 0, height: 0 },
        }} />
      )))}
    </Animated.View>
  );
}

// ── Nuages de nébuleuse ───────────────────────────────────────────────────────
const NEBULA_CLOUDS = [
  { x: SW * 0.05, y: SH * 0.08, w: SW * 0.55, h: SH * 0.22, color: '#7700cc', op: 0.10 },
  { x: SW * 0.40, y: SH * 0.02, w: SW * 0.65, h: SH * 0.18, color: '#cc0066', op: 0.08 },
  { x: SW * 0.60, y: SH * 0.15, w: SW * 0.45, h: SH * 0.20, color: '#0044cc', op: 0.09 },
  { x: SW * 0.10, y: SH * 0.25, w: SW * 0.40, h: SH * 0.15, color: '#00aacc', op: 0.07 },
  { x: SW * 0.55, y: SH * 0.30, w: SW * 0.50, h: SH * 0.18, color: '#aa00ff', op: 0.08 },
  { x: SW * 0.00, y: SH * 0.40, w: SW * 0.35, h: SH * 0.12, color: '#ff0077', op: 0.06 },
];

function NebulaClouds() {
  const pulses = NEBULA_CLOUDS.map(() => useRef(new Animated.Value(0)).current);
  useEffect(() => {
    pulses.forEach((p, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 800),
        Animated.timing(p, { toValue: 1, duration: 4000 + i * 600, useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 4000 + i * 600, useNativeDriver: true }),
      ])).start();
    });
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {NEBULA_CLOUDS.map((c, i) => {
        const opacity = pulses[i].interpolate({ inputRange: [0, 1], outputRange: [c.op * 0.6, c.op * 1.4] });
        return (
          <Animated.View key={i} style={{
            position: 'absolute',
            left: c.x, top: c.y, width: c.w, height: c.h,
            borderRadius: c.h * 0.5,
            backgroundColor: c.color,
            opacity,
          }} />
        );
      })}
    </View>
  );
}

// ── Planète géante ────────────────────────────────────────────────────────────
function GiantPlanet() {
  const pulse = useRef(new Animated.Value(0.85)).current;
  const rot   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,    duration: 5000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.85, duration: 5000, useNativeDriver: true }),
    ])).start();
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const rotateDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const planetR = SW * 0.28;
  const cx = SW * 0.78;
  const cy = SH * 0.18;
  return (
    <View style={{ position: 'absolute', left: cx - planetR, top: cy - planetR }} pointerEvents="none">
      {/* Halo atmosphérique */}
      <Animated.View style={{
        position: 'absolute',
        left: -planetR * 0.35, top: -planetR * 0.35,
        width: planetR * 2.7, height: planetR * 2.7,
        borderRadius: planetR * 1.35,
        backgroundColor: '#3300aa',
        opacity: pulse.interpolate({ inputRange: [0.85, 1], outputRange: [0.08, 0.14] }),
      }} />
      {/* Corps planète */}
      <View style={{
        width: planetR * 2, height: planetR * 2,
        borderRadius: planetR,
        backgroundColor: '#1a0a4a',
        overflow: 'hidden',
      }}>
        {/* Bandes atmosphériques */}
        {[0.15, 0.30, 0.48, 0.62, 0.78].map((frac, i) => (
          <Animated.View key={i} style={{
            position: 'absolute',
            top: planetR * 2 * frac,
            left: 0, right: 0,
            height: planetR * 2 * 0.07,
            backgroundColor: ['#2200aa','#330066','#1100cc','#220055','#280077'][i],
            opacity: 0.5 + i * 0.06,
            transform: [{ rotate: rotateDeg }],
          }} />
        ))}
        {/* Reflet lumineux */}
        <View style={{
          position: 'absolute',
          top: planetR * 0.12, left: planetR * 0.15,
          width: planetR * 0.55, height: planetR * 0.38,
          borderRadius: planetR * 0.25,
          backgroundColor: 'rgba(180,120,255,0.14)',
          transform: [{ rotate: '-30deg' }],
        }} />
      </View>
      {/* Anneau planétaire */}
      <Animated.View style={{
        position: 'absolute',
        top: planetR * 0.72,
        left: -planetR * 0.55,
        width: planetR * 3.1, height: planetR * 0.55,
        borderRadius: planetR * 0.275,
        borderWidth: 4,
        borderColor: 'rgba(140, 80, 255, 0.35)',
        transform: [{ scaleY: 0.28 }],
      }} />
      <Animated.View style={{
        position: 'absolute',
        top: planetR * 0.78,
        left: -planetR * 0.42,
        width: planetR * 2.84, height: planetR * 0.44,
        borderRadius: planetR * 0.22,
        borderWidth: 2,
        borderColor: 'rgba(200, 140, 255, 0.2)',
        transform: [{ scaleY: 0.28 }],
      }} />
    </View>
  );
}

// ── Comètes ───────────────────────────────────────────────────────────────────
const COMET_DATA = Array.from({ length: 4 }, (_, i) => {
  const r = makeRand(i * 5557 + 0xC04E);
  return {
    id: i,
    startY:   SH * (0.05 + r() * 0.35),
    tailLen:  80 + r() * 120,
    size:     3 + r() * 4,
    duration: 1800 + r() * 1400,
    interval: 6000 + r() * 12000,
    delay:    r() * 14000,
    color:    ['#ffffff','#aaddff','#ffeeaa','#ccaaff'][Math.floor(r() * 4)],
    angle:    12 + r() * 22,
  };
});

function Comet({ startY, tailLen, size, duration, interval, delay, color, angle }) {
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  const rad = (angle * Math.PI) / 180;
  const dx  = SW + tailLen;
  const dy  = Math.tan(rad) * dx;

  useEffect(() => {
    const shoot = () => {
      tx.setValue(0); op.setValue(0);
      Animated.parallel([
        Animated.timing(tx, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1,   duration: duration * 0.1, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0,   duration: duration * 0.9, useNativeDriver: true }),
        ]),
      ]).start();
    };
    const timer = setTimeout(function loop() {
      shoot();
      setTimeout(loop, interval + Math.random() * 8000);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const translateX = tx.interpolate({ inputRange: [0, 1], outputRange: [-tailLen, SW + tailLen] });
  const translateY = tx.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });

  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      top: startY, left: 0,
      opacity: op,
      transform: [{ translateX }, { translateY }],
    }}>
      {/* Noyau */}
      <View style={{
        position: 'absolute', right: 0, top: -size / 2,
        width: size * 2, height: size, borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color, shadowOpacity: 1, shadowRadius: size * 2, shadowOffset: { width: 0, height: 0 },
      }} />
      {/* Traîne */}
      <View style={{
        position: 'absolute', right: size, top: -size * 0.25,
        width: tailLen * 0.5, height: size * 0.5,
        borderRadius: size * 0.25, backgroundColor: color, opacity: 0.45,
      }} />
      <View style={{
        position: 'absolute', right: size, top: -size * 0.12,
        width: tailLen * 0.85, height: size * 0.22,
        borderRadius: size * 0.1, backgroundColor: color, opacity: 0.18,
      }} />
    </Animated.View>
  );
}

// ── Trou noir ─────────────────────────────────────────────────────────────────
function BlackHole() {
  const rot   = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 2500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.7, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, []);
  const rotateDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = 28;
  const cx = SW * 0.18, cy = SH * 0.72;
  return (
    <View style={{ position: 'absolute', left: cx - r * 2.5, top: cy - r * 2.5 }} pointerEvents="none">
      {/* Disque d'accrétion */}
      <Animated.View style={{
        position: 'absolute',
        left: r * 0.8, top: r * 1.8,
        width: r * 3.4, height: r * 1.0,
        borderRadius: r * 0.5,
        borderWidth: 3, borderColor: 'rgba(255, 140, 0, 0.5)',
        transform: [{ scaleY: 0.22 }, { rotate: rotateDeg }],
        opacity: pulse,
      }} />
      <Animated.View style={{
        position: 'absolute',
        left: r * 0.4, top: r * 1.9,
        width: r * 4.2, height: r * 1.2,
        borderRadius: r * 0.6,
        borderWidth: 2, borderColor: 'rgba(255, 80, 0, 0.3)',
        transform: [{ scaleY: 0.18 }, { rotate: rotateDeg }],
        opacity: pulse,
      }} />
      {/* Halo gravitationnel */}
      <Animated.View style={{
        position: 'absolute',
        left: r * 0.5, top: r * 0.5,
        width: r * 4, height: r * 4,
        borderRadius: r * 2,
        backgroundColor: '#000000',
        opacity: pulse.interpolate({ inputRange: [0.7, 1], outputRange: [0.55, 0.7] }),
      }} />
      {/* Noyau */}
      <View style={{
        position: 'absolute',
        left: r * 1.5, top: r * 1.5,
        width: r * 2, height: r * 2, borderRadius: r,
        backgroundColor: '#000000',
      }} />
    </View>
  );
}

// ── Grille perspective ────────────────────────────────────────────────────────
const HORIZON_Y = SH * 0.52;
const TRON2     = 'rgba(120, 0, 255, 0.18)';
const TRON2B    = 'rgba(120, 0, 255, 0.45)';
const V_LINES   = [-SW*0.48,-SW*0.32,-SW*0.18,-SW*0.07,0,SW*0.07,SW*0.18,SW*0.32,SW*0.48];
const H_LINES   = [0.04,0.10,0.18,0.28,0.42,0.60,0.82,1.0];

function PurpleGrid() {
  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1,   duration: 2200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.6, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);
  const gridH = SH - HORIZON_Y;
  const CX = SW / 2;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse }]} pointerEvents="none">
      <View style={{ position: 'absolute', left: 0, right: 0, top: HORIZON_Y, bottom: 0, backgroundColor: 'rgba(10,0,30,0.75)' }} />
      {V_LINES.map((offset, i) => {
        const ang = Math.atan2(gridH, offset) * (180 / Math.PI) - 90;
        const len = Math.sqrt(offset * offset + gridH * gridH);
        const central = i === Math.floor(V_LINES.length / 2);
        return (
          <View key={`v${i}`} style={{
            position: 'absolute', left: CX, top: HORIZON_Y,
            width: central ? 1.5 : 1, height: len,
            backgroundColor: central ? TRON2B : TRON2,
            transformOrigin: 'top left', transform: [{ rotate: `${ang}deg` }],
          }} />
        );
      })}
      {H_LINES.map((frac, i) => {
        const y = HORIZON_Y + frac * gridH;
        const spread = frac * SW * 0.55;
        return (
          <View key={`h${i}`} style={{
            position: 'absolute', top: y,
            left: CX - spread, width: spread * 2,
            height: i === H_LINES.length - 1 ? 2 : 1,
            backgroundColor: i === H_LINES.length - 1 ? TRON2B : TRON2,
          }} />
        );
      })}
      <View style={{
        position: 'absolute', top: HORIZON_Y, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(160, 0, 255, 0.6)',
        shadowColor: '#aa00ff', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
      }} />
    </Animated.View>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function SpaceBackground2() {
  return (
    <View style={styles.container}>
      {/* Fond profond */}
      <View style={styles.bg} />
      <View style={styles.bgGlow1} />
      <View style={styles.bgGlow2} />

      {/* Nuages de nébuleuse */}
      <NebulaClouds />

      {/* Étoiles parallaxe — couche lointaine */}
      <StarLayer stars={STAR_DATA[0]} speed={STAR_LAYERS[0].speed} />
      {/* Étoiles parallaxe — couche milieu */}
      <StarLayer stars={STAR_DATA[1]} speed={STAR_LAYERS[1].speed} />
      {/* Étoiles parallaxe — couche proche */}
      <StarLayer stars={STAR_DATA[2]} speed={STAR_LAYERS[2].speed} />

      {/* Planète géante */}
      <GiantPlanet />

      {/* Trou noir */}
      <BlackHole />

      {/* Comètes */}
      {COMET_DATA.map(c => <Comet key={c.id} {...c} />)}

      {/* Grille violette */}
      <PurpleGrid />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bg:        { ...StyleSheet.absoluteFillObject, backgroundColor: '#03000f' },
  bgGlow1: {
    position: 'absolute', top: -SH * 0.2, left: -SW * 0.2,
    width: SW * 0.8, height: SH * 0.6,
    borderRadius: SW * 0.4,
    backgroundColor: '#1a004a', opacity: 0.4,
  },
  bgGlow2: {
    position: 'absolute', top: SH * 0.1, right: -SW * 0.1,
    width: SW * 0.7, height: SH * 0.5,
    borderRadius: SW * 0.35,
    backgroundColor: '#2a0020', opacity: 0.3,
  },
});
