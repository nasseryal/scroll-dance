// ── Profile Screen ────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ScrollView, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, saveProfile, sanitizeGamertag } from '../utils/profile';
import { getPlayerCountry, getFlagEmoji, COUNTRY_NAMES } from '../utils/leaderboard';
import SpaceMenuAnimation from '../components/SpaceMenuAnimation';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [gamertag,    setGamertag]    = useState('');
  const [saved,       setSaved]       = useState(false);
  const [bestScore,   setBestScore]   = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [country]                     = useState(() => getPlayerCountry());

  const savePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getProfile().then(p => setGamertag(p.gamertag || ''));
    AsyncStorage.getItem('playerScores').then(raw => {
      if (!raw) return;
      const scores = JSON.parse(raw);
      setGamesPlayed(scores.length);
      if (scores.length > 0) setBestScore(scores[0].score);
    });
  }, []);

  function handleSave() {
    const tag = sanitizeGamertag(gamertag) || 'JOUEUR';
    setGamertag(tag);
    saveProfile({ gamertag: tag, country });
    setSaved(true);
    Animated.sequence([
      Animated.timing(savePulse, { toValue: 1.08, duration: 120, useNativeDriver: true }),
      Animated.timing(savePulse, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setSaved(false), 2500);
  }

  const initial = gamertag ? gamertag[0] : '?';
  const countryLabel = `${getFlagEmoji(country)} ${COUNTRY_NAMES[country] || country}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050214" />
      <SpaceMenuAnimation />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← RETOUR</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>MON PROFIL</Text>

        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        </View>

        {/* Gamertag actuel */}
        <Text style={styles.currentTag}>{gamertag || '---'}</Text>
        <Text style={styles.countryText}>{countryLabel}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{String(bestScore).padStart(4, '0')}</Text>
            <Text style={styles.statLabel}>MEILLEUR{'\n'}SCORE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{String(gamesPlayed).padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>PARTIES{'\n'}JOUÉES</Text>
          </View>
        </View>

        {/* Séparateur */}
        <View style={styles.separator} />

        {/* Édition gamertag */}
        <Text style={styles.inputLabel}>GAMERTAG</Text>
        <TextInput
          style={styles.input}
          value={gamertag}
          onChangeText={t => { setSaved(false); setGamertag(sanitizeGamertag(t)); }}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          placeholder="MAX 8 CARACTÈRES"
          placeholderTextColor="#330055"
          selectionColor="#aa33ff"
        />
        <Text style={styles.inputHint}>
          Lettres · chiffres · _ uniquement · max 8 caractères
        </Text>

        {/* Bouton save */}
        <Animated.View style={{ transform: [{ scale: savePulse }], marginTop: 24 }}>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveBtnText, saved && styles.saveBtnTextDone]}>
              {saved ? '✓  SAUVEGARDÉ !' : '💾  SAUVEGARDER'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#050214' },
  content: {
    paddingTop: 52,
    paddingHorizontal: 28,
    alignItems: 'center',
  },

  backText: {
    color: '#aa33ff', fontFamily: 'monospace', fontSize: 12,
    letterSpacing: 2, alignSelf: 'flex-start', marginBottom: 16,
  },
  title: {
    color: '#ff33cc', fontFamily: 'monospace', fontSize: 26,
    fontWeight: 'bold', letterSpacing: 8, marginBottom: 28,
    textShadowColor: '#ff33cc', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },

  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, borderColor: '#aa33ff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#aa33ff', shadowOpacity: 0.8, shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 4,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: 'rgba(170, 51, 255, 0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    color: '#cc88ff', fontFamily: 'monospace', fontSize: 36, fontWeight: 'bold',
  },

  currentTag: {
    color: '#ffffff', fontFamily: 'monospace', fontSize: 22,
    fontWeight: 'bold', letterSpacing: 4, marginTop: 10,
    textShadowColor: '#aa33ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
  countryText: {
    color: '#aa33ff', fontFamily: 'monospace', fontSize: 13,
    letterSpacing: 2, marginTop: 6, marginBottom: 24,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#330055', borderRadius: 8,
    backgroundColor: 'rgba(10, 0, 30, 0.55)',
    paddingVertical: 16, paddingHorizontal: 24,
    width: '100%', justifyContent: 'center',
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: {
    color: '#ffee00', fontFamily: 'monospace', fontSize: 24,
    fontWeight: 'bold', letterSpacing: 3,
  },
  statLabel: {
    color: '#550088', fontFamily: 'monospace', fontSize: 10,
    letterSpacing: 2, textAlign: 'center', marginTop: 4,
  },
  statDivider: {
    width: 1, height: 48, backgroundColor: '#330055', marginHorizontal: 16,
  },

  separator: {
    width: '100%', height: 1, backgroundColor: '#220033', marginVertical: 28,
  },

  inputLabel: {
    color: '#550088', fontFamily: 'monospace', fontSize: 10,
    letterSpacing: 4, alignSelf: 'flex-start', marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1.5, borderColor: '#aa33ff', borderRadius: 6,
    backgroundColor: 'rgba(10, 0, 30, 0.7)',
    color: '#cc88ff', fontFamily: 'monospace', fontSize: 22,
    fontWeight: 'bold', letterSpacing: 6,
    paddingVertical: 14, paddingHorizontal: 16,
    textAlign: 'center',
  },
  inputHint: {
    color: '#330055', fontFamily: 'monospace', fontSize: 10,
    letterSpacing: 1, marginTop: 8, textAlign: 'center',
  },

  saveBtn: {
    borderWidth: 2, borderColor: '#00eeff', borderRadius: 6,
    paddingHorizontal: 40, paddingVertical: 14,
    backgroundColor: 'transparent',
    shadowColor: '#00eeff', shadowOpacity: 0.5, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  saveBtnDone: {
    borderColor: '#33ff88',
    shadowColor: '#33ff88',
  },
  saveBtnText: {
    color: '#00eeff', fontFamily: 'monospace', fontSize: 15,
    fontWeight: 'bold', letterSpacing: 3,
  },
  saveBtnTextDone: {
    color: '#33ff88',
  },
});
