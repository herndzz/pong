import { CONFIG } from './config.js';

export class Particle {
  constructor(x, y, ballSpeedX, ballSpeedY) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4 + ballSpeedX * 0.3;
    this.vy = (Math.random() - 0.5) * 4 + ballSpeedY * 0.3;
    this.life = CONFIG.PARTICLE.LIFETIME;
    this.maxLife = CONFIG.PARTICLE.LIFETIME;
    this.size = Math.random() * 3 + 5;
    this.initialSize = this.size;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    const lifeRatio = this.life / this.maxLife;
    this.size = this.initialSize * lifeRatio;
    return this.life > 0;
  }
  draw(ctx, theme) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = theme === 'dark' ? `rgba(255, 165, 0, ${alpha})` : `rgba(255, 69, 0, ${alpha})`;
    ctx.fill();
    ctx.closePath();
  }
}
