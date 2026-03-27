// ── Void Background — placeholder map ────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function VoidBackground() {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <Animated.Text style={[styles.label, { opacity: pulse }]}>
        BIENTÔT
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#04000e',
  },
  label: {
    color: '#220033',
    fontFamily: 'monospace',
    fontSize: 22,
    letterSpacing: 10,
    fontWeight: 'bold',
  },
});
