import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { isSupabaseConfigured, supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import type { User } from "../types";

type Message = {
  type: "bot" | "user";
  content: string;
  time: string;
};

export function ChatbotButton({ user }: { user?: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      content: "¡Hola! Soy tu asistente de salud de Salud Quibdó. ¿En qué puedo ayudarte hoy?",
      time: "ahora"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: inputValue,
      time: "ahora"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      let botResponse = "";

      if (isSupabaseConfigured && supabase) {
        // Call our enhanced chatbot API
        const url = `https://${projectId}.supabase.co`;
        
        // CORREGIDO: Apunta a la nueva función 'api' y la ruta '/chatbot'
        const response = await fetch(`${url}/functions/v1/api/chatbot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": publicAnonKey, // La anon key es necesaria para llamadas no autenticadas
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: currentMessage,
            user_id: user?.id || 'anonymous'
          })
        });

        const result = await response.json();
        botResponse = result.response || "Lo siento, no pude procesar tu mensaje. ¿Puedes intentarlo de nuevo?";
      } else {
        // Fallback local responses for demo mode
        const lowerInput = currentMessage.toLowerCase();
        
        if (lowerInput.includes("fiebre")) {
          botResponse = "Para la fiebre, mantente hidratado y descansa. Si es mayor a 38.5°C o persiste más de 3 días, consulta con un médico. ¿Hay otros síntomas? (Modo demostración - La plataforma no está completamente configurada)";
        } else if (lowerInput.includes("dolor de cabeza")) {
          botResponse = "El dolor de cabeza puede tener varias causas. Asegúrate de beber suficiente agua y descansar. Si es intenso o frecuente, te recomiendo una consulta médica. (Modo demostración)";
        } else if (lowerInput.includes("consulta") || lowerInput.includes("cita")) {
          botResponse = "Puedo ayudarte a agendar una consulta virtual. Haz clic en 'Solicitar Consulta' en la página principal. (Modo demostración - La plataforma no está completamente configurada)";
        } else {
          botResponse = "Entiendo tu consulta. Para una evaluación más precisa, te recomiendo agendar una consulta con uno de nuestros médicos voluntarios. ¿Te ayudo con eso? (Modo demostración)";
        }
      }
      
      const botMessage: Message = {
        type: "bot",
        content: botResponse,
        time: "ahora"
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.log("Chatbot error:", error);
      const errorMessage: Message = {
        type: "bot",
        content: "Disculpa, tengo problemas técnicos. Para una consulta inmediata, te recomiendo agendar una cita con nuestros médicos.",
        time: "ahora"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickButtons = [
    "¿Tengo fiebre?",
    "Agendar consulta",
    "Síntomas COVID",
    "Primeros auxilios"
  ];

  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] z-50">
          <Card className="shadow-2xl">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Asistente de Salud
              </CardTitle>
              <p className="text-blue-100 text-sm">
                Disponible 24/7 para ayudarte
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick buttons */}
              <div className="p-4 border-t">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {quickButtons.map((button, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setInputValue(button);
                        handleSendMessage();
                      }}
                    >
                      {button}
                    </Button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}