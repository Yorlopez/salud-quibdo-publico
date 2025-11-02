import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  projectId && 
  projectId !== "your-project-id" && 
  publicAnonKey && 
  publicAnonKey !== "your-anon-key"
);

// Create singleton Supabase client instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    console.log("Supabase is not configured, using demo mode");
    return null;
  }

  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    // Create new instance only if it doesn't exist
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
    
    console.log("Supabase client initialized successfully");
    return supabaseInstance;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
};

// Export the singleton instance
export const supabase = getSupabaseClient();

// Debug information
console.log("Supabase Configuration:", {
  isConfigured: isSupabaseConfigured,
  projectId: projectId.substring(0, 8) + "...", // Only show first 8 chars for security
  hasClient: !!supabase
});