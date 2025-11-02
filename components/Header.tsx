import { Button } from "./ui/button";
import { Heart, Globe, Menu, User } from "lucide-react";
import type { User as UserType } from "../types";

export function Header({ user, onSignIn, onSignOut, onOpenAppointment }: { 
  user?: UserType; 
  onSignIn: () => void; 
  onSignOut: () => void;
  onOpenAppointment: () => void;
}) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-blue-900">Salud Quibdó</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-gray-700 hover:text-blue-600 transition-colors">
              Inicio
            </a>
            <a href="#servicios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </a>
            <a href="#acerca" className="text-gray-700 hover:text-blue-600 transition-colors">
              Acerca de
            </a>
            <a href="#contacto" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <select className="bg-transparent border-none text-gray-600 focus:outline-none">
                <option>Español</option>
                <option>Emberá</option>
              </select>
            </div>

            {/* User section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Hola, {user.user_metadata?.name || 'Usuario'}</span>
                </div>
                <Button variant="ghost" onClick={onSignOut} className="text-gray-700 hover:text-blue-600">
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" onClick={onSignIn} className="text-gray-700 hover:text-blue-600">
                  Iniciar Sesión
                </Button>
                <Button onClick={onSignIn} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Registrarse
                </Button>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              onClick={user ? onOpenAppointment : onSignIn}
              className="bg-green-600 hover:bg-green-700 text-white hidden lg:flex"
            >
              {user ? "Agenda tu consulta" : "Accede para agendar"}
            </Button>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}