import { describe, it, expect } from 'vitest';
import { CONFIG } from '../src/config.js';
import { Ball } from '../src/ball.js';
import { Paddle } from '../src/paddle.js';

function makeCanvas() {
  return { width: CONFIG.CANVAS.WIDTH, height: CONFIG.CANVAS.HEIGHT };
}

describe('Ball', () => {
  it('resets to center with default speeds', () => {
    const canvas = makeCanvas();
    const b = new Ball(0, 0);
    b.reset(canvas);
    expect(b.x).toBe(canvas.width / 2);
    expect(b.y).toBe(canvas.height / 2);
    expect(Math.abs(b.speedX)).toBe(CONFIG.BALL.DEFAULT_SPEED_X);
    expect(Math.abs(b.speedY)).toBe(CONFIG.BALL.DEFAULT_SPEED_Y);
  });

  it('bounces on wall and reverses Y', () => {
    const canvas = makeCanvas();
    const b = new Ball(canvas.width / 2, 0);
    const game = { audioManager: { playSound: () => {} }, particles: [] };
    b.speedY = -3;
    // direct call via update triggers wall collision when y<=0
    b.update(canvas, new Paddle(0,0), new Paddle(canvas.width-10,0,true), () => {}, game);
    expect(b.speedY).toBe(3);
  });
});
