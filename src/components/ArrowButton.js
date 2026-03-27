// ── ArrowButton — DDR indicator, taille réduite pour tenir dans l'écran ───────
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const ARROW_COLORS = {
  up:    { main: '#00eeff', dark: '#006688', glow: '#00eeff' },
  down:  { main: '#ff33cc', dark: '#880055', glow: '#ff33cc' },
  left:  { main: '#ffaa00', dark: '#885500', glow: '#ffaa00' },
  right: { main: '#33ff88', dark: '#006633', glow: '#33ff88' },
};

const ARROW_PATH = `M 50 5 L 90 45 L 68 45 L 68 75 L 32 75 L 32 45 L 10 45 Z`;
const ROTATION   = { up: '0deg', down: '180deg', left: '270deg', right: '90deg' };

// Taille totale rendue = SVG_SIZE (pas de padding externe)
export const ARROW_RENDER_SIZE = 88; // utilisé par GameScreen pour positionner

export default function ArrowButton({ direction, isActive, size = ARROW_RENDER_SIZE }) {
  const colors = ARROW_COLORS[direction];

  const breathe     = useRef(new Animated.Value(0)).current;
  const glow        = useRef(new Animated.Value(0)).current;
  const activeScale = useRef(new Animated.Value(1)).current;
  const ringScale   = useRef(new Animated.Value(1)).current;
  const ringOp      = useRef(new Animated.Value(0)).current;
  const ringLoopRef = useRef(null);

  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(glow,        { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(activeScale, { toValue: 1.18, friction: 4, tension: 100, useNativeDriver: true }),
      ]).start();
      ringLoopRef.current = Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1.9, duration: 550, useNativeDriver: true }),
          Animated.timing(ringOp,    { toValue: 0,   duration: 550, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(ringOp,    { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ]));
      ringLoopRef.current.start();
    } else {
      if (ringLoopRef.current) ringLoopRef.current.stop();
      Animated.parallel([
        Animated.timing(glow,        { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.spring(activeScale, { toValue: 1, friction: 6,   useNativeDriver: true }),
        Animated.timing(ringOp,      { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  const idleOp   = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.40] });
  const opacity  = isActive ? 1 : idleOp;
  const haloOp   = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] });
  const haloSize = size * 1.7;

  return (
    // Rendu exactement dans `size` × `size` — le halo déborde en position absolute
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>

      {/* Halo diffus — déborde mais ne consomme pas d'espace layout */}
      <Animated.View pointerEvents="none" style={{
        position: 'absolute',
        width: haloSize, height: haloSize, borderRadius: haloSize / 2,
        backgroundColor: colors.glow,
        opacity: haloOp,
        left: -(haloSize - size) / 2,
        top:  -(haloSize - size) / 2,
      }} />

      {/* Ring pulsant */}
      <Animated.View pointerEvents="none" style={{
        position: 'absolute',
        width: size * 1.08, height: size * 1.08,
        borderRadius: (size * 1.08) / 2,
        borderWidth: 2.5, borderColor: colors.main,
        opacity: ringOp,
        transform: [{ scale: ringScale }],
        left: -(size * 0.04), top: -(size * 0.04),
      }} />

      {/* Flèche SVG */}
      <Animated.View style={{ opacity, transform: [{ scale: activeScale }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100"
          style={{ transform: [{ rotate: ROTATION[direction] }] }}>
          <Defs>
            <LinearGradient id={`g${direction}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={colors.main} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.dark} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Contour principal */}
          <Path d={ARROW_PATH} fill="none" stroke={colors.main}
            strokeWidth={isActive ? 8 : 3.5} strokeLinejoin="round"
            opacity={isActive ? 1 : 0.7} />
          {/* Reflet blanc intérieur (actif) */}
          {isActive && <Path d={ARROW_PATH} fill="none" stroke="white"
            strokeWidth={1.8} strokeLinejoin="round" opacity={0.45}
            transform="scale(0.87) translate(6.5,6.5)" />}
          {/* Fill dégradé (actif) */}
          <Path d={ARROW_PATH} fill={isActive ? `url(#g${direction})` : 'none'}
            opacity={isActive ? 0.88 : 0} />
          {/* Double contour intérieur (inactif) */}
          {!isActive && <Path d={ARROW_PATH} fill="none" stroke={colors.main}
            strokeWidth={1.8} strokeLinejoin="round" opacity={0.38}
            transform="scale(0.77) translate(11.5,11.5)" />}
        </Svg>
      </Animated.View>
    </View>
  );
}
