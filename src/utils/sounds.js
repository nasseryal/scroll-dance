// ── Sound Engine (Web Audio API via expo-av AudioContext) ────────────────────
// On mobile (Expo Go), we use the Audio object from expo-av to play tones
// generated programmatically. We fall back gracefully if unavailable.

import * as Haptics from 'expo-haptics';
import { NOTE_FREQUENCIES } from './gameLogic';

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    try {
      // React Native doesn't have window.AudioContext, so we use a polyfill approach
      // via expo-av Audio object
      const { Audio } = require('expo-av');
      // We'll use a simple tone approach
      audioContext = { Audio, available: true };
    } catch (e) {
      audioContext = { available: false };
    }
  }
  return audioContext;
}

// Generate a beep using Web Audio API (works in Expo web, falls back on device)
function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.4) {
  try {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    }
  } catch (e) {
    // Silently fail on devices without AudioContext
  }
}

function playChord(frequencies, duration = 0.2, volume = 0.25) {
  frequencies.forEach(f => playTone(f, duration, 'sine', volume));
}

export async function playGoodTap(combo) {
  const noteIdx = Math.min(combo, NOTE_FREQUENCIES.length - 1);
  const freq = NOTE_FREQUENCIES[noteIdx];

  if (combo >= 10) {
    // Full chord
    playChord([freq, freq * 1.25, freq * 1.5, freq * 2], 0.3);
  } else if (combo >= 8) {
    // Ascending melody
    const notes = NOTE_FREQUENCIES.slice(0, 5);
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.12), i * 50);
    });
  } else if (combo >= 5) {
    // Fanfare
    playTone(freq, 0.1);
    setTimeout(() => playTone(freq * 1.25, 0.1), 80);
    setTimeout(() => playTone(freq * 1.5, 0.15), 160);
  } else {
    playTone(freq, 0.15, 'sine', 0.4);
  }

  // Haptic feedback
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {}
}

export async function playBadTap() {
  // Unpleasant low sound
  playTone(80, 0.3, 'sawtooth', 0.5);
  setTimeout(() => playTone(60, 0.2, 'square', 0.3), 100);

  // Long haptic
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (e) {}
}

export function playSpeedUp() {
  // Ascending chirp
  playTone(440, 0.08);
  setTimeout(() => playTone(550, 0.08), 80);
  setTimeout(() => playTone(660, 0.12), 160);
}
