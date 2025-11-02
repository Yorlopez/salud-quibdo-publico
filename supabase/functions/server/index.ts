// supabase/functions/server/index.ts
// Refactorizado para usar Hono: más limpio y sin logs extraños.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'

const app = new Hono()

// === MIDDLEWARE: CORS ===
// Hono maneja las peticiones OPTIONS automáticamente.
app.use('*', cors({
  origin: '*',
  allowHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

// === RUTA: /chatbot ===
app.post('/chatbot', async (c) => {
  try {
    const body = await c.req.json()
    const { message, user_id } = body
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Falta el campo "message" o es inválido' }, 400)
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) {
      console.error('GROK_API_KEY no está configurada en las variables de entorno de la función.')
      return c.json({ error: 'La configuración del asistente no está completa.' }, 500)
    }

    const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `Eres "Salud Quibdó Asistente". Responde de forma empática, clara y segura. NUNCA diagnostiques. Recomienda consulta si es serio. Emergencias: "Llama al 123". Máximo 250 tokens.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    })

    if (!grokRes.ok) {
      const err = await grokRes.text()
      console.error('Grok API error:', err)
      return c.json({ error: 'Hubo un problema al contactar al asistente de IA.' }, 502) // 502 Bad Gateway
    }

    const data = await grokRes.json()
    const reply = data.choices?.[0]?.message?.content?.trim() || "No pude generar una respuesta en este momento."

    return c.json({ response: reply })

  } catch (error) {
    if (error instanceof SyntaxError) {
      return c.json({ error: 'El cuerpo de la solicitud no es un JSON válido.' }, 400)
    }
    console.error('Error en la ruta /chatbot:', error)
    return c.json({ error: 'Error interno del servidor.' }, 500)
  }
})

// === RUTA: /volunteers/pending ===
app.get('/volunteers/pending', (c) => {
  // TODO: Implementar la lógica para obtener voluntarios de la base de datos.
  // Por ahora, devolvemos una lista vacía como antes.
  return c.json({ volunteers: [] })
})

// === MANEJO DE 404 ===
app.notFound((c) => {
  return c.json({ error: 'Ruta no encontrada' }, 404)
})

// === MANEJO DE ERRORES GLOBALES ===
app.onError((err, c) => {
  console.error('Error no controlado en el servidor:', err)
  return c.json({ error: 'Ocurrió un error inesperado.' }, 500)
})

// El handler que Supabase necesita.
// Hono se encarga de la lógica del servidor.
serve(app.fetch)