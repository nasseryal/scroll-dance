// ── ArrowButton — contour néon directement sur la flèche ─────────────────────
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const ARROW_COLORS = {
  up:    { main: '#00eeff', dark: '#006688' },
  down:  { main: '#ff33cc', dark: '#880055' },
  left:  { main: '#ffaa00', dark: '#885500' },
  right: { main: '#33ff88', dark: '#006633' },
};

const ARROW_PATH = `M 50 5 L 90 45 L 68 45 L 68 75 L 32 75 L 32 45 L 10 45 Z`;
const ROTATION   = { up: '0deg', down: '180deg', left: '270deg', right: '90deg' };

export const ARROW_RENDER_SIZE = 88;

export default function ArrowButton({ direction, isActive, size = ARROW_RENDER_SIZE }) {
  const colors = ARROW_COLORS[direction];

  const breathe     = useRef(new Animated.Value(0)).current;
  const activeScale = useRef(new Animated.Value(1)).current;
  const glowPulse   = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef(null);

  // Pulsation idle
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);

  // Activation — scale + néon pulsant
  useEffect(() => {
    if (isActive) {
      Animated.spring(activeScale, { toValue: 1.24, friction: 4, tension: 100, useNativeDriver: true }).start();
      glowLoopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,    duration: 340, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.55, duration: 340, useNativeDriver: true }),
      ]));
      glowLoopRef.current.start();
    } else {
      if (glowLoopRef.current) glowLoopRef.current.stop();
      Animated.parallel([
        Animated.spring(activeScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(glowPulse,  { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  const idleOp = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.40] });
  const opacity = isActive ? 1 : idleOp;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>

      {/* Halo néon — 3 couches sur la forme de la flèche */}
      {isActive && (
        <Animated.View pointerEvents="none" style={{
          position: 'absolute', left: 0, top: 0,
          opacity: glowPulse,
          transform: [{ scale: activeScale }],
        }}>
          <Svg width={size} height={size} viewBox="0 0 100 100"
            style={{ transform: [{ rotate: ROTATION[direction] }] }}>
            {/* Halo diffus extérieur */}
            <Path d={ARROW_PATH} fill={colors.main} stroke={colors.main}
              strokeWidth={28} strokeLinejoin="round" opacity={0.18} />
            {/* Halo intermédiaire */}
            <Path d={ARROW_PATH} fill="none" stroke={colors.main}
              strokeWidth={15} strokeLinejoin="round" opacity={0.42} />
            {/* Bord lumineux vif */}
            <Path d={ARROW_PATH} fill="none" stroke={colors.main}
              strokeWidth={5} strokeLinejoin="round" opacity={0.85} />
          </Svg>
        </Animated.View>
      )}

      {/* Flèche SVG principale */}
      <Animated.View style={{ opacity, transform: [{ scale: activeScale }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100"
          style={{ transform: [{ rotate: ROTATION[direction] }] }}>
          <Defs>
            <LinearGradient id={`g${direction}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%"   stopColor={colors.main} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.dark} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Contour néon principal */}
          <Path d={ARROW_PATH} fill="none" stroke={colors.main}
            strokeWidth={isActive ? 11 : 3.5} strokeLinejoin="round"
            opacity={isActive ? 1 : 0.7} />

          {/* Reflet blanc intérieur (actif) */}
          {isActive && (
            <Path d={ARROW_PATH} fill="none" stroke="white"
              strokeWidth={2.8} strokeLinejoin="round" opacity={0.72}
              transform="scale(0.87) translate(6.5,6.5)" />
          )}

          {/* Fill dégradé (actif) */}
          <Path d={ARROW_PATH} fill={isActive ? `url(#g${direction})` : 'none'}
            opacity={isActive ? 0.85 : 0} />

          {/* Double contour intérieur subtil (inactif) */}
          {!isActive && (
            <Path d={ARROW_PATH} fill="none" stroke={colors.main}
              strokeWidth={1.8} strokeLinejoin="round" opacity={0.38}
              transform="scale(0.77) translate(11.5,11.5)" />
          )}
        </Svg>
      </Animated.View>

    </View>
  );
}
