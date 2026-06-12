/**
 * Centralized Vietnamese Text-to-Speech (TTS) Manager
 */

// Helper to determine if speech synthesis is supported by browser/OS
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

// Helper to check if a Vietnamese voice is actually installed on the system
export function hasVietnameseVoice(): boolean {
  if (!isSpeechSupported()) return false;
  const voices = window.speechSynthesis.getVoices();
  return voices.some(
    (v) =>
      v.lang.startsWith("vi") ||
      v.lang.includes("Vietnam") ||
      v.lang.toLowerCase().includes("vi-vn")
  );
}

// Helper to check if speech is enabled in parent settings (default to false as requested)
export function isSpeechEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // If not configured, we default to "false" (disabled) to fulfill "Bỏ tính năng giọng đọc"
  const val = localStorage.getItem("kid_voice_enabled");
  return val === "true";
}

// Toggle speech enabled state
export function setSpeechEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("kid_voice_enabled", enabled ? "true" : "false");
}

// Central speak function with safety check and optimized config for children
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

  // 1. Check if user enabled the speech feature (unless forced by manual click)
  if (!isSpeechEnabled() && !options?.force) {
    return;
  }

  const synth = window.speechSynthesis;

  // Cancel any active speech to avoid queue stacking
  synth.cancel();

  // Clean the text from custom system prefixes like [system] etc.
  const cleanText = text.replace(/^\[.*?\]\s*/, "");
  if (!cleanText.trim()) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set Vietnamese language tag
  utterance.lang = "vi-VN";
  
  // Child-friendly voice tone adjustments
  utterance.pitch = options?.pitch ?? 1.35; // Kinder, higher pitch
  utterance.rate = options?.rate ?? 0.95;   // Slightly slower for children's comprehension

  // Event callbacks
  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;


  // Attempt to select the native Vietnamese voice
  const voices = synth.getVoices();
  const viVoice = voices.find(
    (v) =>
      v.lang.startsWith("vi") ||
      v.lang.includes("Vietnam") ||
      v.lang.toLowerCase().includes("vi-vn")
  );

  if (viVoice) {
    utterance.voice = viVoice;
  } else {
    // If voices are loaded but there's absolutely no Vietnamese voice,
    // and the default browser speech synthesis language is not Vietnamese,
    // we cancel speaking to prevent English-accent gibberish reading.
    const isBrowserVi = navigator.language.startsWith("vi");
    if (voices.length > 0 && !isBrowserVi) {
      console.warn("Vietnamese TTS voice not found on this device. Speech cancelled to avoid incorrect accent.");
      return;
    }
  }

  // Handle voices changing dynamically (Web Speech API quirk)
  if (synth.onvoiceschanged === undefined) {
    synth.onvoiceschanged = () => {
      const updatedVoices = synth.getVoices();
      const updatedViVoice = updatedVoices.find(
        (v) =>
          v.lang.startsWith("vi") ||
          v.lang.includes("Vietnam") ||
          v.lang.toLowerCase().includes("vi-vn")
      );
      if (updatedViVoice && !utterance.voice) {
        utterance.voice = updatedViVoice;
      }
    };
  }

  synth.speak(utterance);
}

// Stop any speaking in progress
export function cancelSpeech() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}
