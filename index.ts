// Importa los módulos necesarios
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts' // Importamos las cabeceras CORS
import { Groq } from "npm:groq-sdk";

// --- Inicialización del cliente de Groq (IA) ---
let groq: Groq | null = null;
if (Deno.env.get("GROQ_API_KEY")) {
  groq = new Groq({
    apiKey: Deno.env.get("GROQ_API_KEY"),
  });
  console.log("Cliente de Groq inicializado.");
} else {
  console.warn("GROQ_API_KEY no está configurada. El chatbot usará respuestas de respaldo.");
}

// --- Lógica principal de la función ---
serve(async (req: Request) => {
  // Manejo de la solicitud preflight (previa) de CORS. Esto es CRUCIAL.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Cuando se usa `invoke`, el cuerpo viene como un objeto JSON.
    // Lo parseamos para obtener el `body` que enviamos desde el cliente.
    const requestBody = await req.json();
    const { message, user_id } = requestBody;
    let response = "";

    if (groq) {
      // --- Respuesta generada por IA si Groq está configurado ---
      const systemPrompt = `
        Eres "Salud Quibdó Asistente", un asistente de IA médico para una plataforma de telemedicina en Quibdó, Colombia.
        Tu rol es dar orientación de salud básica, amigable y segura.
        - Tu tono debe ser tranquilizador, empático y profesional.
        - Adapta tus respuestas al contexto de una región tropical como el Chocó (clima, dieta local, etc.).
        - NUNCA des un diagnóstico. Tu objetivo es orientar y educar.
        - SIEMPRE que un síntoma parezca serio o si tienes dudas, recomienda agendar una consulta virtual en la plataforma.
        - Para emergencias (dolor en el pecho, dificultad para respirar, etc.), tu respuesta DEBE ser: "Si tienes una emergencia médica real, como dificultad para respirar o dolor en el pecho, dirígete al hospital más cercano o llama inmediatamente al 123. Tu seguridad es lo más importante."
        - No respondas preguntas que no sean sobre salud.
        - Sé conciso y claro.
      `;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 250,
      });

      response = chatCompletion.choices[0]?.message?.content || "Lo siento, no pude procesar tu solicitud. Intenta de nuevo.";

    } else {
      // --- Respuestas de respaldo si la API de IA no está configurada ---
      response = "Entiendo. Para darte la mejor orientación, te recomiendo agendar una consulta con uno de nuestros médicos. Ellos podrán evaluarte adecuadamente.";
    }

    // Devolver la respuesta al cliente
    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Manejo de errores
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
