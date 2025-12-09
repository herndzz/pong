// Mock minimal 2D canvas context used by the game
function makeCtx() {
  return {
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    closePath: () => {},
    save: () => {},
    restore: () => {},
    fillStyle: '',
    font: '',
    textAlign: '',
    globalAlpha: 1,
    fillText: () => {},
  };
}

// Override getContext on canvas to return a minimal 2D context
HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === '2d') return makeCtx();
  return null;
};

// Mock AudioContext for tests
class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'suspended';
    this.destination = {};
  }
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    };
  }
  resume() { this.state = 'running'; }
}

// Provide on window for jsdom
// eslint-disable-next-line no-undef
window.AudioContext = FakeAudioContext;
// legacy webkit alias
// eslint-disable-next-line no-undef
window.webkitAudioContext = FakeAudioContext;
