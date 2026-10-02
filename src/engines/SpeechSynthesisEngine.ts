export class SpeechSynthesisEngine {
  private static isSpeaking = false;

  /**
   * Speak text with clear, child-friendly articulation
   */
  public static speak(text: string, rate: number = 0.85, pitch: number = 1.05): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // Slightly slower for crisp phonemic comprehension
      utterance.pitch = pitch; // Warm, gentle tone

      // Pick high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')))) ||
                             voices.find(v => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  public static stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
