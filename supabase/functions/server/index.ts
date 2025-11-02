// supabase/functions/server/index.ts
// SERVIDOR UNIFICADO CON HONO + GROK + KV

import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts'
import { cors } from 'https://deno.land/x/hono@v3.11.7/middleware.ts'
import { set, get } from './kv_store.tsx'

const app = new Hono()

// === CONFIGURACIÓN CORS (SEGURO Y FUNCIONAL) ===
app.use('*', cors({
  origin: [
    'https://6906b04d910cce0008d0dfe7--salubquibdo30.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info'],
  maxAge: 86400,
  credentials: true,
}))

// === RUTA: /chatbot (GROK) ===
app.post('/chatbot', async (c) => {
  try {
    // 1. Leer cuerpo
    const body = await c.req.json()
    const { message, user_id } = body

    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Falta "message" o no es texto válido' }, 400)
    }

    // 2. Obtener clave de Grok
    const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
    if (!GROK_API_KEY) {
      console.error('GROK_API_KEY no configurada en variables de entorno')
      return c.json({ error: 'Servicio no disponible' }, 500)
    }

    // 3. Llamar a Grok API
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'Eres Salud Quibdó Asistente. Responde claro, empático y en español. NUNCA hagas diagnósticos médicos. Máximo 250 tokens. Si no sabes, di: "Consulta a un médico."'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 250,
        stream: false,
      }),
    })

    // 4. Manejar errores de Grok
    if (!res.ok) {
      const errText = await res.text()
      console.error('Error Grok API:', res.status, errText)
      return c.json({ error: 'No se pudo contactar al asistente' }, 502)
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return c.json({ error: 'Respuesta vacía del asistente' }, 500)
    }

    // 5. (Opcional) Guardar en KV para historial
    if (user_id) {
      const key = `chat:${user_id}:${Date.now()}`
      await set(key, { message, reply, timestamp: new Date().toISOString() })
    }

    // 6. Respuesta exitosa
    return c.json({ response: reply })

  } catch (error) {
    console.error('Error inesperado en /chatbot:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
})

// === RUTA DE PRUEBA (opcional) ===
app.get('/ping', (c) => {
  return c.json({ status: 'ok', time: new Date().toISOString() })
})

// === EXPORTAR SERVIDOR ===
Deno.serve(app.fetch)