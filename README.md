# Salud Quibdó - Plataforma de Telemedicina (Versión Estática)

Una plataforma de telemedicina diseñada específicamente para brindar atención médica virtual a la comunidad de Quibdó, Colombia. Este proyecto es un sitio web estático construido con HTML, CSS y JavaScript puro, utilizando Supabase como backend.

## 🚀 Inicio Rápido

### Prerrequisitos

- Un navegador web moderno.
- Un servidor web local para desarrollo (como la extensión "Live Server" para VS Code) es recomendado para evitar problemas con CORS.

### Instalación

1. **Clonar el repositorio o descargar los archivos.**
2. **Abrir el archivo `index.html` en tu navegador.**
   - Para una mejor experiencia de desarrollo, se recomienda usar la extensión "Live Server" en Visual Studio Code. Haz clic derecho en `index.html` y selecciona "Open with Live Server".

## 🔧 Configuración de Supabase

Para que la autenticación y la base de datos funcionen, necesitas conectar el proyecto a Supabase.

1. **Crea un proyecto en Supabase**
2. **Obtén tus credenciales:**
   - En tu proyecto de Supabase, ve a "Project Settings" > "API".
   - Copia la **URL del Proyecto** y la **Clave Pública (public anon key)**.
3. **Actualiza las credenciales en el archivo `supabase-script.js`:**
   - Abre el archivo `supabase-script.js`.
   - Reemplaza los valores de `supabaseUrl` y `supabaseKey` con tus credenciales.
   ```javascript
   const supabaseUrl = "TU_URL_DE_SUPABASE";
   const supabaseKey = "TU_CLAVE_PUBLICA_ANON";
   ```

## 📱 Funcionalidades

- ✅ **Consultas virtuales** - Conecta pacientes con médicos.
- ✅ **Autenticación de usuarios** - Inicio de sesión, registro y gestión de perfiles con Supabase Auth.
- ✅ **Paneles de control** - Vistas separadas para pacientes y médicos.
- ✅ **Sistema de calificación** - Los pacientes pueden calificar a los médicos.
- ✅ **Recetas médicas imprimibles** - Generación de recetas en formato PDF.
- ✅ **Monitoreo de salud** - Registro de signos vitales por parte del paciente.
- ✅ **Panel de administración** - Para aprobar médicos voluntarios.
- ✅ **Diseño responsivo** - Optimizado para móviles.

## 🌐 Despliegue

Este es un sitio estático y no requiere un proceso de compilación.

### Vercel / Netlify (Recomendado)

1. Conecta tu repositorio de Git a Vercel o Netlify.
2. En la configuración de "Build & Deploy":
   - **Build Command:** Déjalo **vacío**.
   - **Output Directory / Publish directory:** Déjalo **vacío** o configúralo como el directorio raíz (`.`).
3. Despliega el sitio. La plataforma simplemente servirá los archivos estáticos.

### Servidor Propio
Simplemente sube todos los archivos (`.html`, `.css`, `.js`, imágenes) a tu servidor web.

## 📞 Soporte

Para preguntas o problemas:
- Email: mosqueralopezyoryani@gmail.com

## 📄 Licencia


