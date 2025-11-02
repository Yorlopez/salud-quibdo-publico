// supabase/functions/server/index.ts
// SIN HONO → CON RUTAS SIMPLES (GARANTIZADO)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// === SERVIDOR CON RUTAS ===
serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // === RUTA: /chatbot ===
    if (path === '/chatbot' && req.method === 'POST') {
      const { message, user_id } = await req.json()
      if (!message) return new Response(JSON.stringify({ error: 'Falta message' }), { status: 400, headers: corsHeaders })

      const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
      if (!GROK_API_KEY) return new Response(JSON.stringify({ error: 'GROK_API_KEY no configurada' }), { status: 500, headers: corsHeaders })

      const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
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
              content: `Eres "Salud Quibdó Asistente", médico empático. NUNCA diagnostiques. Recomienda consulta. Emergencias: "Llama al 123". Solo salud. Máx 250 tokens.`.trim()
            },
            { role: 'user', content: message }
          ],
          temperature: 0.3,
          max_tokens: 250,
        }),
      })

      if (!grokRes.ok) {
        const err = await grokRes.text()
        return new Response(JSON.stringify({ error: `Grok falló: ${grokRes.status}` }), { status: 500, headers: corsHeaders })
      }

      const data = await grokRes.json()
      const reply = data.choices[0]?.message?.content?.trim() || "Sin respuesta."

      return new Response(JSON.stringify({ response: reply }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // === RUTA: /volunteers/pending ===
    if (path === '/volunteers/pending' && req.method === 'GET') {
      // Aquí va tu lógica real de Supabase
      const pending = [] // ← Reemplaza con tu consulta
      return new Response(JSON.stringify({ volunteers: pending }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // === RUTA NO ENCONTRADA ===
    return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
      status: 404,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: 'Error interno',
      details: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})