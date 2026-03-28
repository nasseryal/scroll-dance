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

// ── Persistence ───────────────────────────────────────────────────────────────
export async function savePlayerScore(score, country, name = 'YOU') {
  if (!score || score <= 0) return;
  try {
    const raw = await AsyncStorage.getItem('leaderboardEntry');
    const current = raw ? JSON.parse(raw) : null;
    if (!current || score > current.score) {
      await AsyncStorage.setItem('leaderboardEntry', JSON.stringify({ score, country, name }));
    }
  } catch {}
}

export async function getLeaderboard(playerCountry) {
  try {
    const raw = await AsyncStorage.getItem('leaderboardEntry');
    if (!raw) return [];
    const best = JSON.parse(raw);
    if (!best || best.score <= 0) return [];
    return [{
      name: best.name || 'YOU',
      country: best.country || playerCountry,
      score: best.score,
      isPlayer: true,
    }];
  } catch {
    return [];
  }
}
