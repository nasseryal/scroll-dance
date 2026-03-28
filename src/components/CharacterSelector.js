// ── CharacterSelector — réutilisable Home + GameOver ─────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CHARACTERS = [
  { id: 'disco',     label: '🪩 DISCO'       },
  { id: 'forest',    label: '🌿 EXPLORER'    },
  { id: 'city',      label: '🏙️ CITY'        },
  { id: 'astronaut', label: '🚀 ASTRONAUT'   },
  { id: 'void',      label: '◈  BIENTÔT'    },
];

// Score requis pour débloquer chaque personnage
export const CHAR_UNLOCKS = [0, 1000, 2000, 3000, Infinity];

export default function CharacterSelector({ charIndex: charIndexRaw, onChange, highScore = 0 }) {
  const charIndex = Math.min(Math.max(charIndexRaw ?? 0, 0), CHARACTERS.length - 1);
  const prev = () => onChange((charIndex - 1 + CHARACTERS.length) % CHARACTERS.length);
  const next = () => onChange((charIndex + 1) % CHARACTERS.length);
  const locked = highScore < CHAR_UNLOCKS[charIndex];

  return (
    <View style={styles.selector}>
      <TouchableOpacity onPress={prev} style={styles.arrow} activeOpacity={0.6}>
        <Text style={styles.arrowText}>◄</Text>
      </TouchableOpacity>

      <View style={styles.label}>
        <Text style={styles.labelTitle}>PERSO</Text>
        {locked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <Text style={styles.labelName}>{CHARACTERS[charIndex].label}</Text>
        )}
        <View style={styles.dots}>
          {CHARACTERS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i === charIndex && styles.dotActive,
              highScore < CHAR_UNLOCKS[i] && styles.dotLocked,
            ]} />
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={next} style={styles.arrow} activeOpacity={0.6}>
        <Text style={styles.arrowText}>►</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#330055',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(10, 0, 30, 0.55)',
  },
  arrow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  arrowText: {
    color: '#aa33ff',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  label: {
    alignItems: 'center',
    minWidth: 120,
  },
  labelTitle: {
    color: '#440077',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 2,
  },
  labelName: {
    color: '#cc88ff',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  dots: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#330055',
  },
  dotActive: {
    backgroundColor: '#aa33ff',
    shadowColor: '#aa33ff',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  dotLocked: {
    backgroundColor: '#1a0a2a',
    borderWidth: 1,
    borderColor: '#330055',
  },
  lockScore: {
    color: '#550088',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
  },
});
