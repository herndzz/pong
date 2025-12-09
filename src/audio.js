import { SOUND_FREQUENCIES } from './config.js';
import { StorageManager } from './storage.js';

export class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = StorageManager.get('soundEnabled', true);
  }
  playSound(type) {
    if (!this.enabled) return;
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.type = 'sine';
      const freq = SOUND_FREQUENCIES[type.toUpperCase()] || SOUND_FREQUENCIES.DEFAULT;
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      if (type === 'achievement') {
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
      }
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (e) {
      console.warn('Erro ao reproduzir som:', e);
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    StorageManager.set('soundEnabled', this.enabled);
    return this.enabled;
  }
}
