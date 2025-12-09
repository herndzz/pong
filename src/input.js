export class InputController {
  constructor({ onArrowUp, onArrowDown, onPause, onMuteToggle, onTouchMove, onDoubleTap, getCanvasRect }) {
    this.onArrowUp = onArrowUp;
    this.onArrowDown = onArrowDown;
    this.onPause = onPause;
    this.onMuteToggle = onMuteToggle;
    this.onTouchMove = onTouchMove;
    this.onDoubleTap = onDoubleTap;
    this.getCanvasRect = getCanvasRect;
    this.lastTapTime = 0;
  }
  attach(doc, canvas) {
    doc.addEventListener('keydown', (e) => this._onKeyDown(e));
    doc.addEventListener('keyup', (e) => this._onKeyUp(e));
    canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
  }
  _onKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp': this.onArrowUp?.(true); break;
      case 'ArrowDown': this.onArrowDown?.(true); break;
      case 'p': case 'P': this.onPause?.(); break;
      case 'm': case 'M': this.onMuteToggle?.(); break;
      case 'Escape': this.onPause?.(); break; // optionally map ESC to pause
    }
  }
  _onKeyUp(e) {
    if (e.key === 'ArrowUp') this.onArrowUp?.(false);
    if (e.key === 'ArrowDown') this.onArrowDown?.(false);
  }
  _onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.getCanvasRect?.();
    const y = touch.clientY - rect.top;
    this.onTouchMove?.(y);
  }
  _onTouchStart(e) {
    e.preventDefault();
    const now = Date.now();
    if (this.lastTapTime && now - this.lastTapTime < 300) this.onDoubleTap?.();
    this.lastTapTime = now;
    // also update position on touch start
    const touch = e.touches[0];
    const rect = this.getCanvasRect?.();
    const y = touch.clientY - rect.top;
    this.onTouchMove?.(y);
  }
}
