// ── Empty Character — emplacement vide ───────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export default function EmptyCharacter() {
  const pulse  = useRef(new Animated.Value(0.35)).current;
  const float  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.75, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue:  8, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 140, height: 190, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        opacity: pulse,
        transform: [{ translateY: float }],
        alignItems: 'center',
      }}>
        {/* Silhouette */}
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          borderWidth: 2, borderColor: '#aa33ff',
          borderStyle: 'dashed',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{ color: '#aa33ff', fontSize: 32, fontWeight: 'bold' }}>?</Text>
        </View>
      </Animated.View>
    </View>
  );
}
