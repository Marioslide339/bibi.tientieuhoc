/**
 * Centralized Vietnamese Text-to-Speech (TTS) Manager
 * 
 * Strategy:
 * 1. Primary: Google Cloud TTS API via server endpoint /api/tts
 *    → Uses vi-VN-Wavenet-A (soft, natural female Vietnamese voice)
 *    → Perfect for children's educational content
 * 2. Fallback: Browser's Web Speech API (SpeechSynthesis)
 *    → Used when server is unavailable or API key missing
 * 3. Audio caching: In-memory cache to avoid redundant API calls
 */

// ─── Audio Cache ───────────────────────────────────────────────
const audioCache = new Map<string, string>(); // text → objectURL
const MAX_CACHE_SIZE = 100;

function getCacheKey(text: string, pitch: number, rate: number): string {
  return `${text}__p${pitch}__r${rate}`;
}

// ─── Speech State ──────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;
let isFetchingTTS = false;

// ─── Public Helpers ────────────────────────────────────────────

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined";
}

export function hasVietnameseVoice(): boolean {
  // We always have Vietnamese via server TTS
  return true;
}

export function isSpeechEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem("kid_voice_enabled");
  return val === "true";
}

export function setSpeechEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("kid_voice_enabled", enabled ? "true" : "false");
}

// ─── Core Speak Function ───────────────────────────────────────

export function speak(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    force?: boolean;
  }
) {
  if (!isSpeechSupported()) return;

  // Check if user enabled speech (unless forced by manual click)
  if (!isSpeechEnabled() && !options?.force) {
    return;
  }

  // Cancel any active speech
  cancelSpeech();

  // Clean the text
  const cleanText = text.replace(/^\[.*?\]\s*/, "").trim();
  if (!cleanText) return;

  const pitch = options?.pitch ?? 1.0;
  const rate = options?.rate ?? 0.95;
  const cacheKey = getCacheKey(cleanText, pitch, rate);

  // Check cache first
  const cachedUrl = audioCache.get(cacheKey);
  if (cachedUrl) {
    playAudioFromUrl(cachedUrl, options);
    return;
  }

  // Try server TTS first, fallback to browser
  fetchServerTTS(cleanText, rate, cacheKey, options);
}

// ─── Server TTS via Google Cloud ───────────────────────────────

async function fetchServerTTS(
  text: string,
  rate: number,
  cacheKey: string,
  options?: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    force?: boolean;
  }
) {
  if (isFetchingTTS) return;
  isFetchingTTS = true;

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        speakingRate: rate,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS server returned ${response.status}`);
    }

    const data = await response.json();

    if (data.audioContent) {
      // Decode base64 audio and create blob URL
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      const blob = new Blob([audioArray], { type: "audio/mp3" });
      const objectUrl = URL.createObjectURL(blob);

      // Cache the audio URL
      if (audioCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = audioCache.keys().next().value;
        if (firstKey) {
          const oldUrl = audioCache.get(firstKey);
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          audioCache.delete(firstKey);
        }
      }
      audioCache.set(cacheKey, objectUrl);

      // Play the audio
      playAudioFromUrl(objectUrl, options);
    } else {
      throw new Error("No audio content in response");
    }
  } catch (error) {
    console.warn("Server TTS failed, falling back to browser speech:", error);
    fallbackBrowserSpeak(text, options);
  } finally {
    isFetchingTTS = false;
  }
}

// ─── Audio Playback ────────────────────────────────────────────

function playAudioFromUrl(
  url: string,
  options?: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  cancelSpeech();

  const audio = new Audio(url);
  currentAudio = audio;

  // Adjust playback rate for children's comprehension
  audio.playbackRate = options?.rate ?? 0.95;

  audio.onplay = () => {
    options?.onStart?.();
  };

  audio.onended = () => {
    currentAudio = null;
    options?.onEnd?.();
  };

  audio.onerror = () => {
    currentAudio = null;
    options?.onError?.();
  };

  audio.play().catch((err) => {
    console.warn("Audio playback failed:", err);
    currentAudio = null;
    options?.onError?.();
  });
}

// ─── Browser Fallback (Web Speech API) ─────────────────────────

function fallbackBrowserSpeak(
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options?.onError?.();
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.pitch = options?.pitch ?? 1.35;
  utterance.rate = options?.rate ?? 0.95;

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  // Try to find Vietnamese voice
  const voices = synth.getVoices();
  const viVoice = voices.find(
    (v) =>
      v.lang.startsWith("vi") ||
      v.lang.includes("Vietnam") ||
      v.lang.toLowerCase().includes("vi-vn")
  );

  if (viVoice) {
    utterance.voice = viVoice;
  }

  synth.speak(utterance);
}

// ─── Cancel Speech ─────────────────────────────────────────────

export function cancelSpeech() {
  // Stop HTML5 audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  // Also cancel browser speech synthesis as fallback
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
