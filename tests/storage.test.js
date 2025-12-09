import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../src/storage.js';

describe('StorageManager', () => {
  beforeEach(() => {
    // vitest provides jsdom localStorage
    localStorage.clear();
  });

  it('returns default when missing', () => {
    expect(StorageManager.get('x', 42)).toBe(42);
  });

  it('stores JSON and retrieves object', () => {
    StorageManager.set('obj', { a: 1 });
    expect(StorageManager.get('obj')).toEqual({ a: 1 });
  });

  it('handles legacy non-JSON values gracefully', () => {
    localStorage.setItem('legacy', 'true');
    const val = StorageManager.get('legacy', false);
    expect(val === 'true' || val === true).toBeTruthy();
  });
});
