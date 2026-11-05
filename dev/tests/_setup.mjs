// Globales mínimos de Pengu/navegador para importar módulos que usan el logger. Importar ANTES que los módulos de src/.
globalThis.window ??= globalThis
globalThis.DataStore = { _m: new Map(), get(k, d) { return this._m.has(k) ? this._m.get(k) : d }, set(k, v) { this._m.set(k, v) }, remove(k) { this._m.delete(k) } }
