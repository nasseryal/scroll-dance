import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');
const CX = width / 2;
const CY = height / 2;

// ── Grille Tron ───────────────────────────────────────────────────────────────
const HORIZON_Y  = height * 0.52;
const VANISH_X   = CX;
const TRON_COLOR  = 'rgba(0, 238, 255, 0.18)';
const TRON_BRIGHT = 'rgba(0, 238, 255, 0.45)';

const V_LINES = [-width * 0.48, -width * 0.32, -width * 0.18, -width * 0.07,
                  0,
                  width * 0.07, width * 0.18, width * 0.32, width * 0.48];
const H_LINES = [0.04, 0.10, 0.18, 0.28, 0.42, 0.60, 0.82, 1.0];

// ── Étoiles — générées une seule fois hors du composant ──────────────────────
const STAR_COLORS = ['#ffffff', '#cce8ff', '#ffeebb', '#ffccee'];

function seededRand(seed) {
  // LCG simple pour positions reproductibles
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const STARS = Array.from({ length: 160 }, (_, i) => {
  const rand = seededRand(i * 7919 + 12345);
  return {
    id: i,
    x:          rand() * width,
    y:          rand() * HORIZON_Y * 0.95,
    size:       rand() * 2.2 + 0.5,
    durationOn: 600  + rand() * 2000,
    durationOff:400  + rand() * 1800,
    delay:      rand() * 4000,
    maxOpacity: 0.25 + rand() * 0.75,
    color:      STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
  };
});

function Star({ x, y, size, durationOn, durationOff, delay, maxOpacity, color }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: maxOpacity, duration: durationOn,  useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,          duration: durationOff, useNativeDriver: true }),
        Animated.delay(300 + Math.random() * 800),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: size * 1.5,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

function StarField() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map(s => <Star key={s.id} {...s} />)}
    </View>
  );
}

// ── Grille Tron ───────────────────────────────────────────────────────────────
function TronGrid() {
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const gridH = height - HORIZON_Y;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse }]} pointerEvents="none">
      {/* Sol */}
      <View style={{
        position: 'absolute', left: 0, right: 0,
        top: HORIZON_Y, bottom: 0,
        backgroundColor: 'rgba(5, 0, 30, 0.72)',
      }} />

      {/* Lignes verticales perspective */}
      {V_LINES.map((offset, i) => {
        const dx  = offset;
        const ang = Math.atan2(gridH, dx) * (180 / Math.PI) - 90;
        const len = Math.sqrt(dx * dx + gridH * gridH);
        const central = i === Math.floor(V_LINES.length / 2);
        return (
          <View key={`v${i}`} style={{
            position: 'absolute',
            left: VANISH_X, top: HORIZON_Y,
            width: central ? 1.5 : 1,
            height: len,
            backgroundColor: central ? TRON_BRIGHT : TRON_COLOR,
            transformOrigin: 'top left',
            transform: [{ rotate: `${ang}deg` }],
          }} />
        );
      })}

      {/* Lignes horizontales */}
      {H_LINES.map((frac, i) => {
        const y      = HORIZON_Y + frac * gridH;
        const spread = frac * width * 0.55;
        const last   = i === H_LINES.length - 1;
        return (
          <View key={`h${i}`} style={{
            position: 'absolute', top: y,
            left: CX - spread, width: spread * 2,
            height: last ? 2 : 1,
            backgroundColor: last ? TRON_BRIGHT : TRON_COLOR,
          }} />
        );
      })}

      {/* Horizon */}
      <View style={{
        position: 'absolute', top: HORIZON_Y, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(0, 238, 255, 0.55)',
        shadowColor: '#00eeff', shadowOpacity: 1, shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      }} />
    </Animated.View>
  );
}

// ── Étoiles filantes ──────────────────────────────────────────────────────────
const SHOOTING_STARS = Array.from({ length: 5 }, (_, i) => {
  const r = seededRand(i * 6661 + 77777);
  return {
    id:       i,
    startX:   r() * width * 0.7,
    startY:   r() * HORIZON_Y * 0.5,
    length:   60 + r() * 90,
    duration: 500 + r() * 400,
    interval: 4000 + r() * 9000,
    delay:    r() * 12000,
    angle:    25 + r() * 20,        // degrés par rapport à l'horizontal
    color:    ['#ffffff','#cce8ff','#ffeebb','#ffccff'][Math.floor(r() * 4)],
  };
});

function ShootingStar({ startX, startY, length, duration, interval, delay, angle, color }) {
  const tx  = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(0)).current;

  const rad = (angle * Math.PI) / 180;
  const dx  = Math.cos(rad) * length;
  const dy  = Math.sin(rad) * length;

  useEffect(() => {
    const shoot = () => {
      tx.setValue(0);
      op.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(tx, { toValue: 1, duration, useNativeDriver: true, easing: Easing.linear }),
          Animated.sequence([
            Animated.timing(op, { toValue: 1,   duration: duration * 0.15, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0,   duration: duration * 0.85, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    };

    const timer = setTimeout(function loop() {
      shoot();
      setTimeout(loop, interval + Math.random() * 5000);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const translateX = tx.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = tx.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });

  return (
    <Animated.View style={{
      position: 'absolute',
      top: startY, left: startX,
      width: length, height: 1.5,
      opacity: op,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${angle}deg` },
      ],
      transformOrigin: 'left center',
    }}>
      {/* Traîne dégradée simulée avec plusieurs segments */}
      <View style={{ position: 'absolute', right: 0,        width: length * 0.15, height: 1.5, backgroundColor: color,         borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: length * 0.12, width: length * 0.35, height: 1,   backgroundColor: color, opacity: 0.5, borderRadius: 1 }} />
      <View style={{ position: 'absolute', right: length * 0.40, width: length * 0.60, height: 0.8, backgroundColor: color, opacity: 0.18, borderRadius: 1 }} />
    </Animated.View>
  );
}

// ── Astéroïdes ────────────────────────────────────────────────────────────────
const ASTEROID_DATA = Array.from({ length: 8 }, (_, i) => {
  const r = seededRand(i * 4447 + 55555);
  const size = 7 + r() * 26;
  return {
    id:       i,
    size,
    y:        r() * HORIZON_Y * 0.88,
    duration: 14000 + r() * 22000,
    delay:    r() * 10000,
    rotDur:   4000  + r() * 12000,
    br1:      size * (0.25 + r() * 0.45),
    br2:      size * (0.15 + r() * 0.55),
    br3:      size * (0.35 + r() * 0.40),
    br4:      size * (0.10 + r() * 0.60),
    color:    ['#7a7888','#6e6a7a','#8a8070','#5a5868','#9a8878'][Math.floor(r() * 5)],
    opacity:  0.5 + r() * 0.4,
    dirRight: r() > 0.5,
  };
});

function Asteroid({ size, y, duration, delay, rotDur, br1, br2, br3, br4, color, opacity, dirRight }) {
  const tx  = useRef(new Animated.Value(dirRight ? -size * 2 : width + size)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(tx, {
          toValue: dirRight ? width + size : -size * 2,
          duration, easing: Easing.linear, useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: rotDur, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute',
      top: y, left: 0,
      width: size, height: size * 0.72,
      backgroundColor: color,
      borderTopLeftRadius:     br1,
      borderTopRightRadius:    br2,
      borderBottomLeftRadius:  br3,
      borderBottomRightRadius: br4,
      opacity,
      shadowColor: '#aaaacc',
      shadowOpacity: 0.4,
      shadowRadius: size * 0.5,
      shadowOffset: { width: -2, height: 2 },
      transform: [{ translateX: tx }, { rotate }],
    }}>
      {/* Cratère */}
      <View style={{
        position: 'absolute',
        top: size * 0.18, left: size * 0.22,
        width: size * 0.28, height: size * 0.22,
        borderRadius: size * 0.14,
        backgroundColor: 'rgba(0,0,0,0.3)',
      }} />
    </Animated.View>
  );
}

// ── Planètes ──────────────────────────────────────────────────────────────────
const PLANETS = [
  { orbit: 75,  duration: 6000,  size: 28, color: '#00F5FF' },
  { orbit: 130, duration: 10000, size: 38, color: '#FF007A' },
  { orbit: 195, duration: 15000, size: 32, color: '#7000FF' },
];

function OrbitRing({ radius }) {
  return (
    <View style={{
      position: 'absolute',
      top: CY - radius, left: CX - radius,
      width: radius * 2, height: radius * 2,
      borderRadius: radius, borderWidth: 1,
      borderColor: 'rgba(0, 245, 255, 0.15)',
    }} />
  );
}

function PlanetView({ orbit, duration, size, color }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute',
      top: CY - size / 2, left: CX - size / 2,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
      shadowColor: color, shadowOpacity: 0.95,
      shadowRadius: size * 1.2, shadowOffset: { width: 0, height: 0 },
      elevation: 8,
      transform: [{ rotate }, { translateX: orbit }],
    }} />
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function SpaceMenuAnimation() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Fond */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050214' }]} />

      {/* Étoiles scintillantes */}
      <StarField />

      {/* Étoiles filantes */}
      {SHOOTING_STARS.map(s => <ShootingStar key={s.id} {...s} />)}

      {/* Astéroïdes */}
      {ASTEROID_DATA.map(a => <Asteroid key={a.id} {...a} />)}

      {/* Grille Tron */}
      <TronGrid />

      {/* Halo soleil */}
      <View style={{
        position: 'absolute',
        top: CY - 38, left: CX - 38, width: 76, height: 76, borderRadius: 38,
        backgroundColor: 'rgba(255, 0, 122, 0.22)',
        shadowColor: '#FF007A', shadowOpacity: 1, shadowRadius: 40,
        shadowOffset: { width: 0, height: 0 },
      }} />
      {/* Corps soleil */}
      <View style={{
        position: 'absolute',
        top: CY - 22, left: CX - 22, width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#FF007A',
        shadowColor: '#FF007A', shadowOpacity: 1, shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 }, elevation: 10,
      }} />

      {/* Orbites */}
      {PLANETS.map((p, i) => <OrbitRing key={i} radius={p.orbit} />)}

      {/* Planètes */}
      {PLANETS.map((p, i) => <PlanetView key={i} {...p} />)}
    </View>
  );
}
