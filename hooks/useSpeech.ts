/**
 * useSpeech.ts — Thin wrapper around expo-speech for the diagnostic module.
 *
 * Provides a child-friendly TTS experience with Russian language support,
 * slightly higher pitch and slower rate for clarity.
 */
import * as Speech from 'expo-speech';
import { useCallback, useRef, useState } from 'react';

interface SpeechOptions {
  pitch?: number;
  rate?: number;
  language?: string;
  onDone?: () => void;
}

const DEFAULTS: Required<Pick<SpeechOptions, 'pitch' | 'rate' | 'language'>> = {
  pitch: 1.15, // slightly higher → friendlier for kids
  rate: 0.85, // slightly slower → easier to understand
  language: 'ru-RU',
};

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);

  const speak = useCallback((text: string, opts?: SpeechOptions) => {
    // Stop any ongoing utterance first
    Speech.stop();

    setIsSpeaking(true);
    speakingRef.current = true;

    Speech.speak(text, {
      language: opts?.language ?? DEFAULTS.language,
      pitch: opts?.pitch ?? DEFAULTS.pitch,
      rate: opts?.rate ?? DEFAULTS.rate,
      onDone: () => {
        setIsSpeaking(false);
        speakingRef.current = false;
        opts?.onDone?.();
      },
      onStopped: () => {
        setIsSpeaking(false);
        speakingRef.current = false;
      },
      onError: () => {
        setIsSpeaking(false);
        speakingRef.current = false;
      },
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    speakingRef.current = false;
  }, []);

  return { speak, stop, isSpeaking };
}
