import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Détection pays depuis la locale du téléphone ──────────────────────────────
export function getPlayerCountry() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const parts = locale.split(/[-_]/);
    if (parts.length >= 2) {
      const candidate = parts[parts.length - 1].toUpperCase();
      if (candidate.length === 2 && /^[A-Z]+$/.test(candidate)) return candidate;
    }
    const lang = parts[0].toLowerCase();
    const map = {
      fr: 'FR', en: 'US', de: 'DE', ja: 'JP', ko: 'KR',
      pt: 'BR', es: 'ES', it: 'IT', zh: 'CN', ru: 'RU',
      nl: 'NL', sv: 'SE', pl: 'PL', ar: 'AR', hi: 'IN',
    };
    return map[lang] || 'FR';
  } catch {
    return 'FR';
  }
}

export function getFlagEmoji(code) {
  if (!code || code.length !== 2) return '🌍';
  return code.toUpperCase().split('').map(
    c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

export const COUNTRY_NAMES = {
  FR: 'France', US: 'USA', JP: 'Japon', KR: 'Corée',
  BR: 'Brésil', DE: 'Allemagne', GB: 'UK', IT: 'Italie',
  ES: 'Espagne', CN: 'Chine', MX: 'Mexique', CA: 'Canada',
  AU: 'Australie', RU: 'Russie', IN: 'Inde', AR: 'Argentine',
  PL: 'Pologne', SE: 'Suède', NL: 'Pays-Bas', PT: 'Portugal',
};

// ── Classement global simulé ──────────────────────────────────────────────────
const FAKE_SCORES = [
  { name: 'RIKU',   country: 'JP', score: 4820 },
  { name: 'SORA',   country: 'JP', score: 4650 },
  { name: 'MINHO',  country: 'KR', score: 4430 },
  { name: 'ZAK',    country: 'US', score: 4210 },
  { name: 'LENA',   country: 'DE', score: 3980 },
  { name: 'YUKI',   country: 'JP', score: 3840 },
  { name: 'MARCO',  country: 'IT', score: 3720 },
  { name: 'ALEX',   country: 'FR', score: 3600 },
  { name: 'SOFIA',  country: 'ES', score: 3480 },
  { name: 'JAKE',   country: 'AU', score: 3350 },
  { name: 'NINA',   country: 'RU', score: 3220 },
  { name: 'PEDRO',  country: 'BR', score: 3100 },
  { name: 'CLAIRE', country: 'GB', score: 2980 },
  { name: 'LIU',    country: 'CN', score: 2860 },
  { name: 'CARLOS', country: 'MX', score: 2740 },
  { name: 'PRIYA',  country: 'IN', score: 2620 },
  { name: 'EMMA',   country: 'CA', score: 2510 },
  { name: 'LARS',   country: 'SE', score: 2400 },
  { name: 'KATJA',  country: 'PL', score: 2290 },
  { name: 'TOMAS',  country: 'PT', score: 2180 },
  { name: 'HANA',   country: 'JP', score: 2080 },
  { name: 'RYAN',   country: 'US', score: 1980 },
  { name: 'ELENA',  country: 'RU', score: 1880 },
  { name: 'HUGO',   country: 'FR', score: 1790 },
  { name: 'MILA',   country: 'DE', score: 1700 },
  { name: 'FELIX',  country: 'SE', score: 1620 },
  { name: 'ANA',    country: 'BR', score: 1540 },
  { name: 'JIN',    country: 'KR', score: 1460 },
  { name: 'OSCAR',  country: 'ES', score: 1390 },
  { name: 'JULIA',  country: 'IT', score: 1320 },
  { name: 'LEO',    country: 'FR', score: 1260 },
  { name: 'AMY',    country: 'US', score: 1200 },
  { name: 'KENJI',  country: 'JP', score: 1140 },
  { name: 'IVAN',   country: 'RU', score: 1080 },
  { name: 'LUCA',   country: 'IT', score: 1020 },
];

// ── Persistence ───────────────────────────────────────────────────────────────
export async function savePlayerScore(score, country, name = 'YOU') {
  if (!score || score <= 0) return;
  try {
    const raw = await AsyncStorage.getItem('playerScores');
    const scores = raw ? JSON.parse(raw) : [];
    scores.push({ score, country, name, date: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    await AsyncStorage.setItem('playerScores', JSON.stringify(scores.slice(0, 20)));
  } catch {}
}

export async function getLeaderboard(playerCountry) {
  try {
    const raw = await AsyncStorage.getItem('playerScores');
    const playerScores = raw ? JSON.parse(raw) : [];
    const best = playerScores.length > 0 ? playerScores[0] : null;

    const all = FAKE_SCORES.map(e => ({ ...e, isPlayer: false }));
    if (best && best.score > 0) {
      const name = best.name && best.name !== 'YOU' ? best.name : 'YOU';
      all.push({ name, country: playerCountry, score: best.score, isPlayer: true });
    }
    all.sort((a, b) => b.score - a.score);
    return all;
  } catch {
    return FAKE_SCORES.map(e => ({ ...e, isPlayer: false }));
  }
}
