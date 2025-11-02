import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { User } from "../types";

export function Hero({ user, onSignIn, onOpenAppointment }: { 
  user?: User; 
  onSignIn: () => void;
  onOpenAppointment: () => void;
}) {
  return (
    <section id="inicio" className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Atención médica al alcance de todos en{" "}
                <span className="text-blue-600">Quibdó</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Conecta con médicos voluntarios, accede a consultas virtuales y aprende 
                sobre salud preventiva desde tu hogar
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={user ? onOpenAppointment : onSignIn}
              >
                {user ? "Solicitar Consulta" : "Accede para Consultar"}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                onClick={onSignIn}
              >
                Ser Voluntario
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Consultas realizadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Médicos voluntarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Disponibilidad</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1614579093335-b6ab37ddaace?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWxlbWVkaWNpbmUlMjB2aWRlbyUyMGNhbGwlMjBkb2N0b3IlMjBwYXRpZW50fGVufDF8fHx8MTc1NzEyNDEyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Consulta virtual con médico"
                className="w-full h-[400px] object-cover"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">En línea</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900">Dr. María González</div>
                <div>Medicina General</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}