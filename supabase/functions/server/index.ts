// supabase/functions/server/index.ts
// SERVIDOR UNIFICADO CON HONO + GROK + KV

import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { set, get } from './kv_store.tsx'

const app = new Hono()

// === CORS ===
app.use('*', async (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204)
  }
  await next()
})

// === RUTA: /chatbot (GROK) ===
app.post('/chatbot', async (c) => {
  try {
    const { message, user_id } = await c.req.json()
    if (!message) return c.json({ error: 'Falta message' }, 400)

    const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
    if (!GROK_API_KEY) return c.json({ error: 'Clave no configurada' }, 500)

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'Eres Salud Quibdó Asistente. Responde claro, empático. NUNCA diagnostiques. Máx 250 tokens.' },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Grok error:', err)
      return c.json({ error: 'Error con Grok' }, 500)
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim() || "No respuesta."

    return c.json({ response: reply })
  } catch (error) {
    console.error('Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// === OTRAS RUTAS (EJ: /volunteers/pending) ===
// app.get('/volunteers/pending', async (c) => { ... })

Deno.serve(app.fetch)