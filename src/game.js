import { CONFIG } from './config.js';
import { StorageManager } from './storage.js';
import { AudioManager } from './audio.js';
import { AchievementManager } from './achievement.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { InputController } from './input.js';

export class Game {
  constructor() {
    this._initCanvas();
    this._initObjects();
    this._initState();
    this._initManagers();
    this._initUI();
    this._initControls();
    this.showIntro();
  }
  _initCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
  }
  _initObjects() {
    this.paddle1 = new Paddle(0, (this.canvas.height - CONFIG.PADDLE.HEIGHT) / 2);
    this.paddle2 = new Paddle(this.canvas.width - CONFIG.PADDLE.WIDTH, (this.canvas.height - CONFIG.PADDLE.HEIGHT) / 2, true);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
    this.particles = [];
    this.backgroundStars = [];
    this._genStars();
  }
  _initState() {
    this.score = 0;
    this.level = 1;
    this.highScore = StorageManager.get('highScore', 0);
    this.state = 'intro';
    this.difficulty = 'medium';
    this.theme = StorageManager.get('theme', 'dark');
    document.body.className = `${this.theme}-theme`;
    this.gameTime = 0;
    this.gameStartTime = 0;
    this.consecutiveHits = 0;
    this.totalGamesPlayed = StorageManager.get('totalGamesPlayed', 0);
    this.maxSpeed = 0;
    this.ballHits = 0;
    this.aiHits = 0;
    this.playerHits = 0;
    this.combo = 0;
    this.maxCombo = StorageManager.get('maxCombo', 0);
    this.comboTimer = 0;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPauseTime = 0;
    this.upPressed = false;
    this.downPressed = false;
    this.lastTouchY = null;
    this.lastTapTime = 0;
    this.lastUpdate = 0;
    this.frameInterval = 1000 / CONFIG.FPS;
    this.adaptiveDifficulty = StorageManager.get('adaptiveDifficulty', true);
    this.performanceHistory = [];
  }
  _initManagers() {
    this.audioManager = new AudioManager();
    this.achievementManager = new AchievementManager();
  }
  _initUI() {
    this.scoreDisplay = document.getElementById('score');
    this.levelDisplay = document.getElementById('level');
    this.highScoreDisplay = document.getElementById('highScore');
    this.finalScoreDisplay = document.getElementById('finalScore');
    this.finalLevelDisplay = document.getElementById('finalLevel');
    this.gameIntro = document.getElementById('gameIntro');
    this.gameMenu = document.getElementById('gameMenu');
    this.gameOverScreen = document.getElementById('gameOver');
    this.notification = document.getElementById('notification');
    this.achievementsList = document.getElementById('achievementsList');
    this.highScoreDisplay.textContent = this.highScore;
    this.levelDisplay.textContent = this.level;
  }
  _initControls() {
    this.input = new InputController({
      onArrowUp: (pressed) => { this.upPressed = pressed; },
      onArrowDown: (pressed) => { this.downPressed = pressed; },
      onPause: () => this.togglePause(),
      onMuteToggle: () => {
        const s = this.audioManager.toggle();
        this.showNotification(`Som ${s ? 'Ativado' : 'Desativado'}`);
      },
      onTouchMove: (y) => { this.lastTouchY = y; },
      onDoubleTap: () => this.togglePause(),
      getCanvasRect: () => this.canvas.getBoundingClientRect()
    });
    this.input.attach(document, this.canvas);
  }
  _genStars() {
    this.backgroundStars = [];
    for (let i = 0; i < 50; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.className = `${this.theme}-theme`;
    StorageManager.set('theme', this.theme);
  }
  setDifficulty(level) {
    this.difficulty = level;
    this.level = 1;
    this._applyDifficulty();
  }
  _applyDifficulty() {
    const levelFactor = 1 + (this.level - 1) * CONFIG.LEVEL.DIFFICULTY_FACTOR;
    const settingsByDiff = {
      easy: { speedX: 4 * levelFactor, speedY: 2 * levelFactor, aiSpeed: 6 * levelFactor, aiHeight: 120 / levelFactor },
      hard: { speedX: 7 * levelFactor, speedY: 5 * levelFactor, aiSpeed: 10 * levelFactor, aiHeight: 80 / levelFactor },
      medium:{ speedX: 5 * levelFactor, speedY: 3 * levelFactor, aiSpeed: 8 * levelFactor, aiHeight: 100 / levelFactor }
    };
    const s = settingsByDiff[this.difficulty];
    this.ball.defaultSpeedX = s.speedX;
    this.ball.defaultSpeedY = s.speedY;
    this.paddle2.speed = s.aiSpeed;
    this.paddle2.height = s.aiHeight;
    this.ball.reset(this.canvas);
    // Não resetar a raquete da IA aqui, para não sobrescrever velocidade/altura
    this.levelDisplay.textContent = this.level;
  }
  togglePause() {
    if (this.state !== 'playing') return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pauseStartTime = Date.now();
      this.showNotification('Jogo Pausado - Pressione P para continuar');
    } else {
      this.totalPauseTime += Date.now() - this.pauseStartTime;
      this.showNotification('Jogo Retomado');
      this.lastUpdate = performance.now();
      this.update();
    }
  }
  _updateStats() {
    if (this.gameStartTime && !this.isPaused) {
      this.gameTime = Date.now() - this.gameStartTime - this.totalPauseTime;
    }
    const currentSpeed = Math.sqrt(this.ball.speedX ** 2 + this.ball.speedY ** 2);
    this.maxSpeed = Math.max(this.maxSpeed, currentSpeed);
    if (this.comboTimer > 0) this.comboTimer--; else if (this.combo > 0) this.combo = 0;
  }
  updateScore() {
    this.score++;
    this.consecutiveHits++;
    this.combo++;
    this.comboTimer = CONFIG.COMBO.RESET_TIME;
    if (this.combo > this.maxCombo) { this.maxCombo = this.combo; StorageManager.set('maxCombo', this.maxCombo); }
    this.scoreDisplay.textContent = this.score;
    this.audioManager.playSound('score');
    if (this.combo >= CONFIG.COMBO.MIN_FOR_NOTIFICATION) {
      this.audioManager.playSound('combo');
      this.showNotification(`Combo x${this.combo}`);
    }
    if (this.score % CONFIG.LEVEL.POINTS_PER_LEVEL === 0) {
      this.level++;
      this._applyDifficulty();
      this.showNotification(`Nível ${this.level}`);
    }
    this.achievementManager.check(this);
  }
  // Input handlers migrated to InputController
  showNotification(message) {
    this.notification.textContent = message;
    this.notification.style.display = 'block';
    setTimeout(() => { this.notification.style.display = 'none'; }, 3000);
  }
  showIntro() {
    this.state = 'intro';
    this.gameIntro.style.display = 'block';
    this.gameMenu.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
  }
  showMenu() {
    this.state = 'menu';
    this.gameIntro.style.display = 'none';
    this.gameMenu.style.display = 'block';
    this.gameOverScreen.style.display = 'none';
    this._updateMenuDisplay();
    this.achievementManager.updateDisplay(this.achievementsList);
  }
  _updateMenuDisplay() {
    const el = (id) => document.getElementById(id);
    el('totalGames').textContent = this.totalGamesPlayed;
    el('maxComboDisplay').textContent = this.maxCombo;
    const soundButton = el('btnSound');
    if (soundButton) soundButton.textContent = this.audioManager.enabled ? '🔊 Som: ON' : '🔇 Som: OFF';
    const aiButton = el('btnAI');
    if (aiButton) aiButton.textContent = this.adaptiveDifficulty ? '🤖 IA Adaptativa: ON' : '🤖 IA Adaptativa: OFF';
  }
  showGameOver() {
    this.state = 'gameover';
    this.audioManager.playSound('gameover');
    this._updateGameOverDisplay();
    this._updateHighScore();
    this.achievementManager.check(this);
  }
  _updateGameOverDisplay() {
    this.finalScoreDisplay.textContent = this.score;
    this.finalLevelDisplay.textContent = this.level;
    document.getElementById('finalTime').textContent = Math.floor(this.gameTime / 1000);
    document.getElementById('finalCombo').textContent = this.maxCombo;
    document.getElementById('finalMaxSpeed').textContent = Math.floor(this.maxSpeed);
    this.gameOverScreen.style.display = 'block';
  }
  _updateHighScore() {
    let newRecord = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.set('highScore', this.highScore);
      this.highScoreDisplay.textContent = this.highScore;
      newRecord = true;
    }
    const recordNotification = document.getElementById('newRecordNotification');
    recordNotification.style.display = newRecord ? 'block' : 'none';
  }
  start() {
    this.state = 'playing';
    this.score = 0;
    this.level = 1;
    this.consecutiveHits = 0;
    this.ballHits = 0;
    this.aiHits = 0;
    this.playerHits = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxSpeed = 0;
    this.isPaused = false;
    this.totalPauseTime = 0;
    this.gameStartTime = Date.now();
    this.totalGamesPlayed++;
    StorageManager.set('totalGamesPlayed', this.totalGamesPlayed);
    this.scoreDisplay.textContent = this.score;
    this.levelDisplay.textContent = this.level;
    this.ball.reset(this.canvas);
    this.paddle1.reset();
    this.paddle2.reset();
    this.setDifficulty(this.difficulty);
    this.particles = [];
    this.gameIntro.style.display = 'none';
    this.gameMenu.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
    this.notification.style.display = 'none';
    this.lastUpdate = performance.now();
    this.update();
  }
  drawHUD() {
    this._drawStars();
    const pointsToNextLevel = 5 - (this.score % 5);
    const progress = (5 - pointsToNextLevel) / 5;
    this.ctx.fillStyle = this.theme === 'dark' ? '#555' : '#ccc';
    this.ctx.fillRect(10, 10, 100, 10);
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(10, 10, 100 * progress, 10);
    this.ctx.fillStyle = this.theme === 'dark' ? '#fff' : '#000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`Nível ${this.level} (${pointsToNextLevel} para próximo)`, 10, 35);
    if (this.combo > 1) {
      this.ctx.save();
      this.ctx.fillStyle = 'gold';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      const comboY = 80 + Math.sin(Date.now() * 0.01) * 5;
      this.ctx.fillText(`COMBO x${this.combo}!`, this.canvas.width / 2, comboY);
      this.ctx.restore();
    }
    this.ctx.save();
    this.ctx.fillStyle = this.theme === 'dark' ? '#fff' : '#000';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'right';
    const stats = [
      `Tempo: ${Math.floor(this.gameTime / 1000)}s`,
      `Velocidade: ${Math.floor(Math.sqrt(this.ball.speedX ** 2 + this.ball.speedY ** 2))}`,
      `Hits: ${this.ballHits}`,
      `Max Combo: ${this.maxCombo}`
    ];
    stats.forEach((stat, i) => this.ctx.fillText(stat, this.canvas.width - 10, 15 + i * 15));
    this.ctx.restore();
    if (this.isPaused) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Pressione P para continuar', this.canvas.width / 2, this.canvas.height / 2 + 40);
      this.ctx.restore();
    }
  }
  update(timestamp) {
    if (this.state !== 'playing' || this.isPaused) {
      if (this.state === 'playing' && this.isPaused) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawHUD();
        requestAnimationFrame((ts) => this.update(ts));
      }
      return;
    }
    if (timestamp - this.lastUpdate < this.frameInterval) {
      requestAnimationFrame((ts) => this.update(ts));
      return;
    }
    this.lastUpdate = timestamp;
    this._updateStats();
    if (this.adaptiveDifficulty) this._updateAdaptiveAI();
    this.paddle2.moveAI(this.ball.y, this.canvas.height);
    if (this.upPressed) this.paddle1.moveUp();
    if (this.downPressed) this.paddle1.moveDown(this.canvas.height);
    if (this.lastTouchY !== null) {
      this.paddle1.y = Math.max(0, Math.min(this.lastTouchY - this.paddle1.height / 2, this.canvas.height - this.paddle1.height));
    }
    this.particles = this.particles.filter(p => p.update());
    if (!this.ball.update(this.canvas, this.paddle1, this.paddle2, () => this.updateScore(), this)) {
      this.consecutiveHits = 0;
      this.showGameOver();
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => p.draw(this.ctx, this.theme));
    this.paddle1.draw(this.ctx, this.theme);
    this.paddle2.draw(this.ctx, this.theme);
    this.ball.draw(this.ctx, this.theme);
    this.drawHUD();
    requestAnimationFrame((ts) => this.update(ts));
  }
  _updateAdaptiveAI() {
    this.performanceHistory.push({ score: this.score, time: this.gameTime, level: this.level });
    if (this.performanceHistory.length > 10) this.performanceHistory.shift();
    if (this.performanceHistory.length >= 3) {
      const avgScore = this.performanceHistory.reduce((s, p) => s + p.score, 0) / this.performanceHistory.length;
      if (avgScore > this.level * 3) this.paddle2.speed = Math.min(this.paddle2.speed * 1.02, 15);
      else if (avgScore < this.level) this.paddle2.speed = Math.max(this.paddle2.speed * 0.98, 3);
    }
  }
  _drawStars() {
    this.backgroundStars.forEach(star => {
      star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
      star.opacity = Math.max(0.2, Math.min(0.8, star.opacity));
      this.ctx.save();
      this.ctx.globalAlpha = star.opacity;
      this.ctx.fillStyle = this.theme === 'dark' ? '#ffffff' : '#cccccc';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
}
