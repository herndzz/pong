export class StorageManager {
  static get(key, defaultValue = null) {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      // Retorna valor bruto quando não for JSON (retrocompatibilidade)
      return raw || defaultValue;
    }
  }
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Fallback simples
      localStorage.setItem(key, String(value));
    }
  }
  static clear() {
    localStorage.clear();
  }
}
