import { Injectable, signal } from '@angular/core';

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

/**
 * Text-to-speech (listening, pronunciation) and speech-to-text (speaking practice)
 * using the browser Web Speech API — no audio files or paid API needed. When a lesson
 * has an uploaded audio file (Supabase Storage) the player uses that instead.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  readonly speaking = signal(false);
  readonly listening = signal(false);
  readonly rate = signal(1);

  readonly ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  readonly sttSupported =
    typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  private recognition: RecognitionLike | null = null;

  speak(text: string, lang: string, rate = this.rate()): Promise<void> {
    if (!this.ttsSupported || !text) return Promise.resolve();
    speechSynthesis.cancel();
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      const voice = this.pickVoice(lang);
      if (voice) u.voice = voice;
      u.onstart = () => this.speaking.set(true);
      u.onend = u.onerror = () => {
        this.speaking.set(false);
        resolve();
      };
      speechSynthesis.speak(u);
    });
  }

  stopSpeaking(): void {
    if (this.ttsSupported) speechSynthesis.cancel();
    this.speaking.set(false);
  }

  /** Records one utterance and resolves with the transcript (empty string if nothing heard). */
  listen(lang: string): Promise<string> {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return Promise.reject(new Error('unsupported'));
    this.recognition?.abort();
    const rec: RecognitionLike = new Ctor();
    this.recognition = rec;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    return new Promise((resolve, reject) => {
      let text = '';
      rec.onresult = (e) => (text = e.results[0]?.[0]?.transcript ?? '');
      rec.onerror = (e) => {
        this.listening.set(false);
        if (e.error === 'no-speech' || e.error === 'aborted') resolve('');
        else reject(new Error(e.error));
      };
      rec.onend = () => {
        this.listening.set(false);
        resolve(text);
      };
      this.listening.set(true);
      rec.start();
    });
  }

  stopListening(): void {
    this.recognition?.stop();
  }

  private pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = speechSynthesis.getVoices();
    const base = lang.slice(0, 2);
    return (
      voices.find((v) => v.lang === lang && /Google|Natural|Online/i.test(v.name)) ??
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(base))
    );
  }
}
