import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Impact } from "./components/Impact";
import { Education } from "./components/Education";
import { Footer } from "./components/Footer";
import { ChatbotButton } from "./components/ChatbotButton";
import { AuthModal } from "./components/AuthModal";
import { AppointmentModal } from "./components/AppointmentModal";
import { supabase, isSupabaseConfigured } from "./utils/supabase/client";

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    console.log("App.tsx: Starting initialization");
    
    // Safety timeout to ensure loading screen doesn't stay forever
    const safetyTimeout = setTimeout(() => {
      console.warn("App.tsx: Safety timeout reached, forcing app to load");
      setIsLoading(false);
    }, 5000); // 5 second safety timeout

    const checkSession = async () => {
      try {
        console.log("App.tsx: Checking session", { isSupabaseConfigured, hasSupabase: !!supabase });
        
        if (isSupabaseConfigured && supabase) {
          console.log("App.tsx: Attempting to get session from Supabase");
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.log("App.tsx: Session check error:", error);
          } else if (session?.user) {
            console.log("App.tsx: User session found");
            setUser(session.user);
          } else {
            console.log("App.tsx: No active session");
          }
        } else {
          console.log("App.tsx: Supabase not configured, skipping session check");
        }
      } catch (error) {
        console.error("App.tsx: Session check failed:", error);
      } finally {
        // Clear the safety timeout and set loading to false
        clearTimeout(safetyTimeout);
        setIsLoading(false);
        console.log("App.tsx: Initialization complete");
      }
    };

    checkSession();

    // Listen for auth changes only if Supabase is configured
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (isSupabaseConfigured && supabase) {
      console.log("App.tsx: Setting up auth state listener");
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("App.tsx: Auth state change:", event);
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      });
      subscription = authSubscription;
    }

    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleOpenAppointment = () => {
    if (user) {
      setShowAppointmentModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Cargando Salud Quibdó...</p>
          <p className="text-gray-500 text-sm">
            Estado: {isSupabaseConfigured ? 'Conectando con Supabase' : 'Modo demostración'}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Revisa la consola del navegador para más detalles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onOpenAppointment={handleOpenAppointment}
      />
      <main>
        <Hero 
          user={user}
          onSignIn={() => setShowAuthModal(true)}
          onOpenAppointment={handleOpenAppointment}
        />
        <Services />
        <Impact />
        <Education />
      </main>
      <Footer />
      <ChatbotButton user={user} />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {user && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          user={user}
        />
      )}
    </div>
  );
}