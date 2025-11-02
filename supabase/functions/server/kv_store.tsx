// kv_store.tsx - Capa de abstracción para Deno KV (mockeado para pruebas locales)

interface KVEntry<T> {
  value: T | null
}

// Mock de Deno KV (usa Map en memoria)
const kv = {
  store: new Map<string, unknown>(),

  async set(keyParts: string[], value: unknown): Promise<void> {
    const key = keyParts.join(':')
    this.store.set(key, value)
  },

  async get<T>(keyParts: string[]): Promise<KVEntry<T>> {
    const key = keyParts.join(':')
    return { value: this.store.has(key) ? (this.store.get(key) as T) : null }
  },

  async getMany<T>(keys: string[][]): Promise<KVEntry<T>[]> {
    return keys.map(k => this.get<T>(k))
  },

  async *list<T>({ prefix }: { prefix: string[] }): AsyncIterable<KVEntry<T>> {
    const prefixKey = prefix.join(':')
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefixKey)) {
        yield { value: value as T }
      }
    }
  },

  async delete(keyParts: string[]): Promise<void> {
    const key = keyParts.join(':')
    this.store.delete(key)
  },
}

// === FUNCIONES PÚBLICAS ===

export async function set(key: string, value: unknown): Promise<void> {
  await kv.set([key], value)
}

export async function get<T>(key: string): Promise<T | null> {
  const result = await kv.get<T>([key])
  return result.value
}

export async function mget<T>(keys: string[]): Promise<(T | null)[]> {
  const results = await kv.getMany<T>(keys.map(k => [k]))
  return results.map(r => r.value)
}

export async function getByPrefix<T>(prefix: string): Promise<T[]> {
  const entries: T[] = []
  for await (const entry of kv.list<T>({ prefix: [prefix] })) {
    if (entry.value !== null) entries.push(entry.value)
  }
  return entries
}

export async function del(key: string): Promise<void> {
  await kv.delete([key])
}