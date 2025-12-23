'use client';

import { useState, useCallback, useEffect } from 'react';

interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

interface TextSegment {
  text: string;
  lang: 'th-TH' | 'en-US';
}

// Split text into segments by language (Thai vs English)
function splitByLanguage(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  // Thai Unicode range: \u0E00-\u0E7F
  const thaiRegex = /[\u0E00-\u0E7F]+/g;

  let lastIndex = 0;
  let match;

  while ((match = thaiRegex.exec(text)) !== null) {
    // Add English segment before Thai (if any)
    if (match.index > lastIndex) {
      const engText = text.slice(lastIndex, match.index).trim();
      if (engText) {
        segments.push({ text: engText, lang: 'en-US' });
      }
    }
    // Add Thai segment
    const thaiText = match[0].trim();
    if (thaiText) {
      segments.push({ text: thaiText, lang: 'th-TH' });
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining English text (if any)
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      segments.push({ text: remainingText, lang: 'en-US' });
    }
  }

  return segments;
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback(
    (text: string, options: TTSOptions = {}) => {
      if (!isSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set options
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Find a suitable voice
      const preferredVoice = voices.find(
        (voice) =>
          voice.lang.startsWith(options.lang || 'en') && voice.localService
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        options.onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speakEnglish = useCallback(
    (text: string) => {
      speak(text, { lang: 'en-US' });
    },
    [speak]
  );

  const speakThai = useCallback(
    (text: string) => {
      speak(text, { lang: 'th-TH' });
    },
    [speak]
  );

  // Speak text with multiple languages (auto-detect and switch)
  const speakMultiLang = useCallback(
    (text: string, options: Omit<TTSOptions, 'lang'> = {}) => {
      if (!isSupported) return;

      // Clean markdown and split by language
      const cleanText = text.replace(/[#*`>\[\]()_~]/g, '').trim();
      const segments = splitByLanguage(cleanText);

      if (segments.length === 0) {
        options.onEnd?.();
        return;
      }

      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex >= segments.length) {
          setIsSpeaking(false);
          options.onEnd?.();
          return;
        }

        const segment = segments[currentIndex];
        const utterance = new SpeechSynthesisUtterance(segment.text);

        utterance.lang = segment.lang;
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // Find a suitable voice
        const preferredVoice = voices.find(
          (voice) => voice.lang.startsWith(segment.lang.split('-')[0]) && voice.localService
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          currentIndex++;
          speakNext();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      };

      // Cancel any ongoing speech and start
      window.speechSynthesis.cancel();
      speakNext();
    },
    [isSupported, voices]
  );

  return {
    speak,
    speakEnglish,
    speakThai,
    speakMultiLang,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}
