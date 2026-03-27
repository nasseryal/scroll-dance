import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem('playerProfile');
    return raw ? JSON.parse(raw) : { gamertag: '' };
  } catch {
    return { gamertag: '' };
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem('playerProfile', JSON.stringify(profile));
  } catch {}
}

export function sanitizeGamertag(tag) {
  return tag.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 8);
}
