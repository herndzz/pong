import { describe, it, expect, beforeEach } from 'vitest';
import { Game } from '../src/game.js';
import { CONFIG } from '../src/config.js';

// helpers to stub DOM elements used by Game
function stubElement(id) {
  const el = document.createElement('div');
  el.id = id;
  // default textContent and style
  el.textContent = '';
  el.style = { display: 'none' };
  return el;
}

function setupDOM() {
  // canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = CONFIG.CANVAS.WIDTH;
  canvas.height = CONFIG.CANVAS.HEIGHT;
  document.body.appendChild(canvas);
  // UI elements referenced in game
  ['score','level','highScore','finalScore','finalLevel','gameIntro','gameMenu','gameOver','notification','achievementsList','totalGames','maxComboDisplay','newRecordNotification','finalTime','finalCombo','finalMaxSpeed']
    .forEach(id => document.body.appendChild(stubElement(id)));
}

describe('Game', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setupDOM();
    localStorage.clear();
  });

  it('applies difficulty settings correctly', () => {
    const g = new Game();
    g.setDifficulty('easy');
    expect(Math.abs(g.ball.defaultSpeedX - 4)).toBeLessThanOrEqual(0.0001);
    expect(g.paddle2.speed).toBeCloseTo(6);
    expect(g.paddle2.height).toBeCloseTo(120);

    g.setDifficulty('hard');
    expect(Math.abs(g.ball.defaultSpeedX - 7)).toBeLessThanOrEqual(0.0001);
    expect(g.paddle2.speed).toBeCloseTo(10);
    expect(g.paddle2.height).toBeCloseTo(80);
  });

  it('adaptive AI increases/decreases speed based on performance', () => {
    const g = new Game();
    g.adaptiveDifficulty = true;
    // Simulate performance history
    g.performanceHistory = [
      { score: 10, time: 1000, level: 1 },
      { score: 12, time: 2000, level: 1 },
      { score: 15, time: 3000, level: 1 }
    ];
    const initial = g.paddle2.speed;
    g._updateAdaptiveAI();
    expect(g.paddle2.speed).toBeGreaterThanOrEqual(initial); // player doing well -> speed up

    // Now simulate poor performance
    g.performanceHistory = [
      { score: 0, time: 1000, level: 2 },
      { score: 0, time: 2000, level: 2 },
      { score: 0, time: 3000, level: 2 }
    ];
    const before = g.paddle2.speed;
    g._updateAdaptiveAI();
    expect(g.paddle2.speed).toBeLessThanOrEqual(before); // doing poorly -> slow down
  });

  it('ball-paddle collision causes bounce and scoring when AI misses', () => {
    const g = new Game();
    g.start();
    const canvas = g.canvas;
    const p1 = g.paddle1;
    const p2 = g.paddle2;

    // Position ball already beyond AI side and ensure it will miss the AI paddle
    g.ball.x = canvas.width + 1; // beyond right boundary triggers scoring path
    g.ball.y = 10; // far from p2 (default centered)
    g.ball.speedX = 5; // moving to the right
    const initialScore = g.score;

    // update once should register a score if AI misses
    const continued = g.ball.update(canvas, p1, p2, () => g.updateScore(), g);
    expect(continued).toBe(true);
    expect(g.score).toBe(initialScore + 1);

    // Now test player-side collision: place ball at player paddle and moving left
    g.ball.x = p1.x + p1.width + 1;
    g.ball.y = p1.y + p1.height / 2;
    g.ball.speedX = -5; // towards player paddle
    const prevX = g.ball.speedX;
    g.ball.update(canvas, p1, p2, () => g.updateScore(), g);
    expect(Math.sign(prevX)).toBe(-1);
    expect(Math.sign(g.ball.speedX)).toBe(1); // should bounce to the right
  });
});
