// Bezpieczny dostęp do localStorage: w trybie prywatnym, w testach (Node) albo przy zablokowanej pamięci
// działa na pamięci w procesie, więc aplikacja zawsze się uruchamia.

const memory = new Map<string, string>()

function backend(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    /* dostęp zablokowany */
  }
  return {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => void memory.set(k, v),
    removeItem: (k) => void memory.delete(k),
  }
}

export const storage = {
  getJSON<T>(key: string): T | null {
    try {
      const raw = backend().getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  setJSON(key: string, value: unknown) {
    try {
      backend().setItem(key, JSON.stringify(value))
    } catch {
      /* brak miejsca albo zablokowane — stan zostaje w pamięci */
    }
  },
  remove(key: string) {
    try {
      backend().removeItem(key)
    } catch {
      /* ignoruj */
    }
  },
}
