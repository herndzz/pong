import { describe, it, expect } from 'vitest';
import { CONFIG } from '../src/config.js';
import { Paddle } from '../src/paddle.js';

describe('Paddle', () => {
  it('moves up and clamps to top', () => {
    const p = new Paddle(0, 1);
    p.moveUp();
    expect(p.y).toBe(0);
    p.moveUp();
    expect(p.y).toBe(0);
  });

  it('moves down and clamps to bottom', () => {
    const p = new Paddle(0, 0);
    const h = CONFIG.CANVAS.HEIGHT;
    for (let i = 0; i < 100; i++) p.moveDown(h);
    expect(p.y).toBeLessThanOrEqual(h - p.height);
  });
});
