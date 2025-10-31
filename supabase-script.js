// Salud Quibdó - Cliente Central de Supabase
// Este archivo crea una única instancia del cliente de Supabase y la hace accesible
// globalmente para evitar conflictos y código repetido.

(function() {
    const SUPABASE_URL = 'https://bhgfmrnczeixfanmtwya.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ2Ztcm5jemVpeGZhbm10d3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjM5NTMsImV4cCI6MjA3MjY5OTk1M30.JsWtrbipyhsScdbEjQsEGXc9k4BraD-OIiUeDcIr358';
    
    // Asegurarse de que el objeto global 'supabase' de la CDN exista.
    if (window.supabase) {
        // Adjuntar el cliente al objeto window para que sea accesible globalmente.
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Exponer el cliente y las variables en el objeto window para que sean accesibles globalmente.
        window.supabaseClient = supabaseClient;
        window.SUPABASE_INFO = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
        console.log('Cliente central de Supabase inicializado.');
    } else {
        console.error('Error: La librería de Supabase (CDN) no se cargó antes de supabase-script.js');
    }
})();