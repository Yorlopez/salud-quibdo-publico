// c:\Users\mosqu\OneDrive\Documents\salud-quibdo-publico\supabase\functions\make-server-5c249a46\kv_store.tsx
// (removed invalid reference to "deno.ns")

// Este archivo actúa como una capa de abstracción para Deno KV.
// Deno KV es una base de datos Key-Value integrada en el entorno de Deno.

// Abre la base de datos KV. Si no se especifica una ruta, usa la predeterminada.
// Reemplazo para Node.js: usar Map como mock de KV.
const kv = {
  store: new Map<string, unknown>(),
  async set([key]: [string], value: unknown) {
    this.store.set(key, value);
  },
  async get<T>([key]: [string]) {
    return { value: (this.store.has(key) ? (this.store.get(key) as T) : null) };
  },
  async getMany<T>(keys: [string][]) {
    return keys.map(([key]) => ({ value: (this.store.has(key) ? (this.store.get(key) as T) : null) }));
  },
  async *list<T>({ prefix }: { prefix: [string] }) {
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefix[0])) {
        yield { value: value as T };
      }
    }
  },
  async delete([key]: [string]) {
    this.store.delete(key);
  }
};

/**
 * Guarda un valor en el almacén KV.
 * @param key La clave bajo la cual se guardará el valor.
 * @param value El valor a guardar.
 */
export async function set(key: string, value: unknown): Promise<void> {
  await kv.set([key], value);
}

/**
 * Obtiene un valor del almacén KV.
 * @param key La clave del valor a obtener.
 * @returns El valor si se encuentra, o null si no.
 */
export async function get<T>(key: string): Promise<T | null> {
  const result = await kv.get<T>([key]);
  return result.value;
}

/**
 * Obtiene múltiples valores del almacén KV.
 * @param keys Un array de claves a obtener.
 * @returns Un array con los valores correspondientes.
 */
export async function mget<T>(keys: string[]): Promise<(T | null)[]> {
  const kvKeys = keys.map(k => [k]);
  const results = await kv.getMany<T[]>(kvKeys);
  return results.map((entry: { value: T | null; }) => entry.value);
}

/**
 * Obtiene todas las entradas que coinciden con un prefijo de clave.
 * @param prefix El prefijo de la clave a buscar.
 * @returns Un array con los valores de las entradas encontradas.
 */
export async function getByPrefix<T>(prefix: string): Promise<T[]> {
  const entries = [];
  const iter = kv.list<T>({ prefix: [prefix] });
  for await (const entry of iter) {
    entries.push(entry.value);
  }
  return entries;
}

/**
 * Elimina una entrada del almacén KV.
 * @param key La clave de la entrada a eliminar.
 */
export async function del(key: string): Promise<void> {
  await kv.delete([key]);
}
