import { Game } from './game.js';
import { StorageManager } from './storage.js';

// Inicializa o jogo quando a página carrega
window.addEventListener('DOMContentLoaded', () => {
  // Expõe "game" no escopo global para os botões inline do HTML
  window.game = new Game();
  // Expõe StorageManager para uso pontual
  window.StorageManager = StorageManager;

  // Garante que o AudioContext seja iniciado após gesto do usuário
  const resumeAudio = () => {
    try {
      const ctx = window.game && window.game.audioManager && window.game.audioManager.audioContext;
      if (ctx && ctx.state !== 'running') {
        ctx.resume();
      }
    } catch {}
    document.removeEventListener('click', resumeAudio);
    document.removeEventListener('touchstart', resumeAudio, { passive: true });
  };
  document.addEventListener('click', resumeAudio);
  document.addEventListener('touchstart', resumeAudio, { passive: true });

  // Bind UI events
  const byId = (id) => document.getElementById(id);
  const g = window.game;

  const btnContinue = byId('btnContinue');
  const btnEasy = byId('btnEasy');
  const btnMedium = byId('btnMedium');
  const btnHard = byId('btnHard');
  const btnTheme = byId('btnTheme');
  const btnSound = byId('btnSound');
  const btnAI = byId('btnAI');
  const btnReset = byId('btnResetStats');
  const btnPlayAgain = byId('btnPlayAgain');
  const btnBackToMenu = byId('btnBackToMenu');

  if (btnContinue) btnContinue.addEventListener('click', () => g.showMenu());
  if (btnEasy) btnEasy.addEventListener('click', () => { g.setDifficulty('easy'); g.start(); });
  if (btnMedium) btnMedium.addEventListener('click', () => { g.setDifficulty('medium'); g.start(); });
  if (btnHard) btnHard.addEventListener('click', () => { g.setDifficulty('hard'); g.start(); });
  if (btnTheme) btnTheme.addEventListener('click', () => g.toggleTheme());
  if (btnSound) btnSound.addEventListener('click', () => {
    const enabled = g.audioManager.toggle();
    btnSound.textContent = enabled ? 'Som: ON' : 'Som: OFF';
  });
  if (btnAI) btnAI.addEventListener('click', () => {
    g.adaptiveDifficulty = !g.adaptiveDifficulty;
    StorageManager.set('adaptiveDifficulty', g.adaptiveDifficulty);
    btnAI.textContent = g.adaptiveDifficulty ? 'IA Adaptativa: ON' : 'IA Adaptativa: OFF';
  });
  if (btnReset) btnReset.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja resetar todas as estatísticas?')) {
      StorageManager.clear();
      location.reload();
    }
  });
  if (btnPlayAgain) btnPlayAgain.addEventListener('click', () => g.start());
  if (btnBackToMenu) btnBackToMenu.addEventListener('click', () => g.showMenu());
});
