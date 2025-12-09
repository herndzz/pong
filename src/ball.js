import { CONFIG } from './config.js';
import { Particle } from './particle.js';

export class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.BALL.SIZE;
    this.speedX = CONFIG.BALL.DEFAULT_SPEED_X;
    this.speedY = CONFIG.BALL.DEFAULT_SPEED_Y;
    this.trail = [];
    this.defaultSpeedX = CONFIG.BALL.DEFAULT_SPEED_X;
    this.defaultSpeedY = CONFIG.BALL.DEFAULT_SPEED_Y;
  }
  update(canvas, paddle1, paddle2, scoreCallback, game) {
    this.x += this.speedX;
    this.y += this.speedY;
    this._updateTrail();
    this._checkWallCollision(canvas, game);
    this._checkPaddleCollision(canvas, paddle1, paddle2, scoreCallback, game);
    return this._checkGameEnd(canvas, paddle1, paddle2, game);
  }
  _updateTrail() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 15) this.trail.shift();
  }
  _checkWallCollision(canvas, game) {
    if (this.y <= 0 || this.y >= canvas.height - this.size) {
      this.speedY = -this.speedY;
      game.audioManager.playSound('hit');
      this._createParticles(game);
    }
  }
  _checkPaddleCollision(canvas, paddle1, paddle2, scoreCallback, game) {
    if (this.x <= paddle1.x + paddle1.width && this.x + this.size >= paddle1.x && this.y + this.size >= paddle1.y && this.y <= paddle1.y + paddle1.height && this.speedX < 0) {
      this._handlePaddleHit(paddle1, scoreCallback, game, true);
    } else if (this.x + this.size >= paddle2.x && this.x <= paddle2.x + paddle2.width && this.y + this.size >= paddle2.y && this.y <= paddle2.y + paddle2.height && this.speedX > 0) {
      this._handlePaddleHit(paddle2, null, game, false);
    }
  }
  _handlePaddleHit(paddle, scoreCallback, game, isPlayer) {
    const hitPoint = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    if (isPlayer) {
      this.speedX = Math.abs(this.speedX) * 1.05;
      this.x = paddle.x + paddle.width + 2;
      scoreCallback();
      game.playerHits++;
    } else {
      this.speedX = -Math.abs(this.speedX) * 1.05;
      this.x = paddle.x - this.size - 2;
      game.aiHits++;
    }
    this.speedY = hitPoint * 6;
    this.speedX = Math.max(-CONFIG.BALL.MAX_SPEED, Math.min(CONFIG.BALL.MAX_SPEED, this.speedX));
    this.speedY = Math.max(-15, Math.min(15, this.speedY));
    game.audioManager.playSound('hit');
    game.ballHits++;
    this._createParticles(game);
  }
  _checkGameEnd(canvas, paddle1, paddle2, game) {
    if (this.x + this.size < 0) {
      if (this.y + this.size < paddle1.y || this.y > paddle1.y + paddle1.height) {
        return false;
      }
    } else if (this.x > canvas.width) {
      if (this.y + this.size < paddle2.y || this.y > paddle2.y + paddle2.height) {
        this.reset(canvas);
        game.updateScore();
        return true;
      }
    }
    return true;
  }
  _createParticles(game) {
    for (let i = 0; i < CONFIG.PARTICLE.COUNT_ON_HIT; i++) {
      game.particles.push(new Particle(this.x, this.y, this.speedX, this.speedY));
    }
  }
  reset(canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speedX = this.defaultSpeedX * (Math.random() > 0.5 ? 1 : -1);
    this.speedY = this.defaultSpeedY * (Math.random() > 0.5 ? 1 : -1);
    this.trail = [];
  }
  draw(ctx, theme) {
    const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
    const hue = Math.min(360, speed * 20);
    this.trail.forEach((pos, index) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.size / 2 * (1 - index / 15), 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? `hsla(${hue}, 100%, 70%, ${1 - index / 15})` : `hsla(${hue}, 100%, 30%, ${1 - index / 15})`;
      ctx.fill();
      ctx.closePath();
    });
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'dark' ? `hsl(${hue}, 100%, 70%)` : `hsl(${hue}, 100%, 30%)`;
    ctx.fill();
    ctx.closePath();
  }
}
