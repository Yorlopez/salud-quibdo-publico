import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Groq } from "npm:groq-sdk";

// Deno runtime object (declarado para satisfacer a TypeScript)
declare const Deno: any;

const app = new Hono();

// --- Middleware ---
app.use('*', cors({
  origin: '*',
  allowHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
}));

// --- Cliente de Supabase ---
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- Helper de Autenticación ---
async function getAuthenticatedUser(c: any) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return { user: null, error: "No authorization header" };
  const accessToken = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return { user, error };
}

// --- RUTA: OBTENER MÉDICOS PENDIENTES ---
app.get("/volunteers/pending", async (c) => {
  const { user: adminUser, error: authError } = await getAuthenticatedUser(c);
  if (authError || !adminUser) return c.json({ error: "No autorizado" }, 401);

  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const pendingDoctors = users.filter(user =>
      user.user_metadata?.user_type === 'doctor' &&
      user.user_metadata?.verification_status === 'pending'
    );

    return c.json({
      volunteers: pendingDoctors.map(doctor => ({
        user_id: doctor.id,
        full_name: doctor.user_metadata.full_name || 'No especificado',
        email: doctor.email,
        specialty: doctor.user_metadata.specialty || 'No especificada',
        license: doctor.user_metadata.professional_license || doctor.user_metadata.license_number || 'No especificada'
      }))
    });
  } catch (error) {
    console.error("Error fetching pending volunteers:", error);
    return c.json({ error: "Error interno al obtener voluntarios pendientes" }, 500);
  }
});

// --- RUTA: CHATBOT ---
app.post('/chatbot', async (c) => {
  try {
    const { message, user_id } = await c.req.json();
    let response = "El servicio de IA no está disponible. Para una mejor orientación, agenda una consulta.";
    
    if (Deno.env.get("GROQ_API_KEY")) {
        const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });
        const systemPrompt = `Eres "Salud Quibdó Asistente", un asistente de IA médico...`; // (Tu prompt aquí)
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
            model: "llama3-8b-8192",
            temperature: 0.3,
            max_tokens: 250,
        });
        response = chatCompletion.choices[0]?.message?.content || "No pude procesar tu solicitud.";
    }
    
    return c.json({ response });
  } catch (error) {
    console.error("Chatbot error:", error);
    return c.json({ error: "Error en el chatbot" }, 500);
  }
});

// --- PUNTO DE ENTRADA ÚNICO Y LIMPIO ---
Deno.serve(app.fetch);
