/**
 * Polish text-to-speech for hands-free play. Uses the system voice (Siri /
 * Google) — free, offline on most phones. Capacitor can swap in a native TTS later.
 */
let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (voice || typeof speechSynthesis === 'undefined') return voice;
  const voices = speechSynthesis.getVoices();
  voice = voices.find((v) => v.lang === 'pl-PL' && v.localService) ?? voices.find((v) => v.lang.startsWith('pl')) ?? null;
  return voice;
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    voice = null;
    pickVoice();
  });
}

export const canSpeak = () => typeof speechSynthesis !== 'undefined';

export function speak(text: string) {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/…/g, '...'));
  u.lang = 'pl-PL';
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = 1;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel();
}
