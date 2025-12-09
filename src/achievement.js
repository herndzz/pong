import { StorageManager } from './storage.js';

export class Achievement {
  constructor(id, name, description, condition) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.condition = condition;
    this.unlocked = false;
  }
}

export class AchievementManager {
  constructor() {
    this.achievements = this._init();
    this._load();
  }
  _init() {
    return [
      new Achievement('score10', 'Pontuador Iniciante', 'Marque 10 pontos em uma partida', (g) => g.score >= 10),
      new Achievement('score25', 'Pontuador Intermediário', 'Marque 25 pontos em uma partida', (g) => g.score >= 25),
      new Achievement('score50', 'Pontuador Avançado', 'Marque 50 pontos em uma partida', (g) => g.score >= 50),
      new Achievement('score100', 'Mestre dos Pontos', 'Marque 100 pontos em uma partida', (g) => g.score >= 100),
      new Achievement('level3', 'Mestre de Níveis', 'Alcance o nível 3', (g) => g.level >= 3),
      new Achievement('level5', 'Veterano', 'Alcance o nível 5', (g) => g.level >= 5),
      new Achievement('level10', 'Lenda', 'Alcance o nível 10', (g) => g.level >= 10),
      new Achievement('speedDemon', 'Demônio da Velocidade', 'Alcançar velocidade máxima da bola', (g) => g.ball && Math.abs(g.ball.speedX) > 15),
      new Achievement('survivor', 'Sobrevivente', 'Jogar por mais de 2 minutos', (g) => g.gameTime >= 120000),
      new Achievement('perfectStart', 'Início Perfeito', 'Marcar 5 pontos seguidos no início', (g) => g.consecutiveHits >= 5 && g.score === g.consecutiveHits)
    ];
  }
  _load() {
    const saved = StorageManager.get('achievements', []);
    this.achievements.forEach(a => { a.unlocked = saved.includes(a.id); });
  }
  _save() {
    StorageManager.set('achievements', this.achievements.filter(a => a.unlocked).map(a => a.id));
  }
  check(game) {
    this.achievements.forEach(a => {
      if (!a.unlocked && a.condition(game)) {
        a.unlocked = true;
        game.showNotification(`Conquista Desbloqueada: ${a.name}`);
        game.audioManager.playSound('achievement');
        this._save();
      }
    });
  }
  updateDisplay(element) {
    element.innerHTML = '<h3>Conquistas</h3><ul>' +
      this.achievements.map(a => `<li class="${a.unlocked ? 'unlocked' : 'locked'}">${a.name}: ${a.description}</li>`).join('') +
      '</ul>';
  }
}
