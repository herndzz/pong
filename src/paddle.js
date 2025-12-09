import { CONFIG } from './config.js';

export class Paddle {
  constructor(x, y, isAI = false) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.PADDLE.WIDTH;
    this.height = CONFIG.PADDLE.HEIGHT;
    this.speed = CONFIG.PADDLE.SPEED;
    this.isAI = isAI;
    this.defaultHeight = CONFIG.PADDLE.HEIGHT;
    this.defaultSpeed = CONFIG.PADDLE.SPEED;
  }
  moveAI(ballY, canvasHeight) {
    if (!this.isAI) return;
    const center = this.y + this.height / 2;
    const errorMargin = this.height * 0.2;
    if (center < ballY - errorMargin) this.y += this.speed * 0.7;
    if (center > ballY + errorMargin) this.y -= this.speed * 0.7;
    this.y = Math.max(0, Math.min(this.y, canvasHeight - this.height));
  }
  moveUp() { this.y = Math.max(0, this.y - this.speed); }
  moveDown(canvasHeight) { this.y = Math.min(canvasHeight - this.height, this.y + this.speed); }
  reset() { this.height = this.defaultHeight; this.speed = this.defaultSpeed; }
  draw(ctx, theme) {
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
