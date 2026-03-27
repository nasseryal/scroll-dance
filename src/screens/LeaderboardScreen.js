// ── Leaderboard Screen ────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, StatusBar,
} from 'react-native';
import {
  getLeaderboard, getPlayerCountry, getFlagEmoji, COUNTRY_NAMES,
} from '../utils/leaderboard';
import SpaceMenuAnimation from '../components/SpaceMenuAnimation';

const { width } = Dimensions.get('window');

const MEDAL        = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

// Meilleur score par pays à partir de la liste globale
function computeByCountry(scores) {
  const map = {};
  scores.forEach(s => {
    if (!map[s.country] || s.score > map[s.country].score) {
      map[s.country] = { country: s.country, score: s.score, isPlayer: s.isPlayer };
    }
  });
  return Object.values(map).sort((a, b) => b.score - a.score);
}

export default function LeaderboardScreen({ navigation }) {
  const [scores,  setScores]  = useState([]);
  const [tab,     setTab]     = useState(0); // 0=global 1=mon pays 2=par pays
  const [country] = useState(() => getPlayerCountry());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(country).then(s => { setScores(s); setLoading(false); });
  }, []);

  const countryLabel = `${getFlagEmoji(country)} ${COUNTRY_NAMES[country] || country}`;

  // Données selon l'onglet
  const globalScores    = scores;
  const countryScores   = scores.filter(s => s.country === country);
  const byCountryScores = computeByCountry(scores);

  const TABS = ['🌍 MONDE', `${getFlagEmoji(country)} MON PAYS`, '🏅 PAR PAYS'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050214" />
      <SpaceMenuAnimation />

      <View style={styles.ui}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backText}>← RETOUR</Text>
          </TouchableOpacity>
          <Text style={styles.title}>CLASSEMENT</Text>
          <Text style={styles.countryDetected}>{countryLabel}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((label, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setTab(i)}
              style={[styles.tab, tab === i && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Col headers */}
        {tab === 2 ? (
          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 44 }]}>#</Text>
            <Text style={[styles.colText, { flex: 1 }]}>PAYS</Text>
            <Text style={[styles.colText, { width: 72, textAlign: 'right' }]}>RECORD</Text>
          </View>
        ) : (
          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 44 }]}>#</Text>
            <Text style={[styles.colText, { flex: 1 }]}>JOUEUR</Text>
            <Text style={[styles.colText, { width: 72, textAlign: 'right' }]}>SCORE</Text>
          </View>
        )}

        {/* Liste */}
        {loading ? (
          <Text style={styles.loadingText}>CHARGEMENT…</Text>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>

            {/* ── MONDE / MON PAYS ── */}
            {tab !== 2 && (() => {
              const displayed = tab === 0 ? globalScores : countryScores;
              return displayed.map((entry, i) => {
                const globalRank = globalScores.indexOf(entry) + 1;
                const rankDisplay = tab === 0 ? globalRank : i + 1;
                const isTop3 = rankDisplay <= 3;
                return (
                  <View key={i} style={[styles.row, entry.isPlayer && styles.rowPlayer]}>
                    <View style={{ width: 44, alignItems: 'center' }}>
                      {isTop3
                        ? <Text style={styles.medal}>{MEDAL[rankDisplay - 1]}</Text>
                        : <Text style={[styles.rankText, entry.isPlayer && styles.rankPlayer]}>#{rankDisplay}</Text>
                      }
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.flag}>{getFlagEmoji(entry.country)}</Text>
                      <Text
                        style={[styles.nameText, entry.isPlayer && styles.namePlayer]}
                        numberOfLines={1}
                      >
                        {entry.name}
                      </Text>
                    </View>
                    <Text style={[
                      styles.scoreText,
                      isTop3 && { color: MEDAL_COLORS[rankDisplay - 1] },
                      entry.isPlayer && styles.scorePlayer,
                    ]}>
                      {String(entry.score).padStart(4, '0')}
                    </Text>
                  </View>
                );
              });
            })()}

            {/* ── PAR PAYS ── */}
            {tab === 2 && byCountryScores.map((entry, i) => {
              const isTop3       = i < 3;
              const isMyCountry  = entry.country === country;
              return (
                <View key={i} style={[styles.row, isMyCountry && styles.rowPlayer]}>
                  <View style={{ width: 44, alignItems: 'center' }}>
                    {isTop3
                      ? <Text style={styles.medal}>{MEDAL[i]}</Text>
                      : <Text style={[styles.rankText, isMyCountry && styles.rankPlayer]}>#{i + 1}</Text>
                    }
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.flag}>{getFlagEmoji(entry.country)}</Text>
                    <Text
                      style={[styles.nameText, isMyCountry && styles.namePlayer]}
                      numberOfLines={1}
                    >
                      {COUNTRY_NAMES[entry.country] || entry.country}
                    </Text>
                  </View>
                  <Text style={[
                    styles.scoreText,
                    isTop3 && { color: MEDAL_COLORS[i] },
                    isMyCountry && styles.scorePlayer,
                  ]}>
                    {String(entry.score).padStart(4, '0')}
                  </Text>
                </View>
              );
            })}

            {/* Vide */}
            {tab === 1 && countryScores.length === 0 && (
              <Text style={styles.emptyText}>
                Aucun score pour {countryLabel}{'\n'}Joue une partie pour apparaître !
              </Text>
            )}

            <View style={{ height: 48 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050214' },
  ui: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 52,
    paddingHorizontal: 16,
  },

  header: { alignItems: 'center', marginBottom: 16 },
  backText: {
    color: '#aa33ff', fontFamily: 'monospace', fontSize: 12,
    letterSpacing: 2, alignSelf: 'flex-start', marginBottom: 6,
  },
  title: {
    color: '#ff33cc', fontFamily: 'monospace', fontSize: 26,
    fontWeight: 'bold', letterSpacing: 8,
    textShadowColor: '#ff33cc', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  countryDetected: {
    color: '#aa33ff', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, marginTop: 4,
  },

  tabs: {
    flexDirection: 'row', marginBottom: 12,
    borderRadius: 6, borderWidth: 1, borderColor: '#330055', overflow: 'hidden',
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: 'transparent' },
  tabActive: {
    backgroundColor: 'rgba(170, 51, 255, 0.22)',
    borderBottomWidth: 2, borderBottomColor: '#aa33ff',
  },
  tabText:       { color: '#440077', fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 },
  tabTextActive: { color: '#cc88ff' },

  colHeader: {
    flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 5,
    borderBottomWidth: 1, borderBottomColor: 'rgba(170, 51, 255, 0.3)', marginBottom: 4,
  },
  colText: { color: '#550088', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },

  list: { flex: 1 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(51, 0, 80, 0.5)',
  },
  rowPlayer: {
    backgroundColor: 'rgba(0, 238, 255, 0.07)',
    borderRadius: 6, marginVertical: 2,
    borderWidth: 1, borderColor: 'rgba(0, 238, 255, 0.18)',
  },

  medal:    { fontSize: 17 },
  rankText: { color: '#550088', fontFamily: 'monospace', fontSize: 12, letterSpacing: 1 },
  rankPlayer: { color: '#00eeff' },

  flag: { fontSize: 16, marginRight: 8 },
  nameText: { color: '#cc88ff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 1, flex: 1 },
  namePlayer: {
    color: '#00eeff', fontWeight: 'bold',
    textShadowColor: '#00eeff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5,
  },

  scoreText: {
    color: '#ffee00', fontFamily: 'monospace', fontSize: 15,
    fontWeight: 'bold', letterSpacing: 2, width: 72, textAlign: 'right',
  },
  scorePlayer: {
    color: '#00eeff',
    textShadowColor: '#00eeff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 7,
  },

  loadingText: {
    color: '#550088', fontFamily: 'monospace', fontSize: 13,
    letterSpacing: 3, textAlign: 'center', marginTop: 60,
  },
  emptyText: {
    color: '#550088', fontFamily: 'monospace', fontSize: 13,
    letterSpacing: 2, textAlign: 'center', marginTop: 60, lineHeight: 24,
  },
});
