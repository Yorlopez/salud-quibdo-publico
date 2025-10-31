import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  const legalLinks = [
    "Política de Privacidad",
    "Términos de Uso",
    "Consentimiento de Datos",
    "Aviso Legal"
  ];

  const services = [
    "Consultas Virtuales",
    "Historial Médico",
    "Educación en Salud",
    "Chatbot de Salud"
  ];

  const contact = [
    { icon: <Mail className="h-4 w-4" />, text: "info@saludquibdo.co" },
    { icon: <Phone className="h-4 w-4" />, text: "+57 300 123 4567" },
    { icon: <MapPin className="h-4 w-4" />, text: "Quibdó, Chocó, Colombia" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">Salud Quibdó</h1>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Conectando a la comunidad de Quibdó con atención médica de calidad 
              a través de la tecnología.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              {contact.map((item, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <span className="text-blue-400">{item.icon}</span>
                  <span className="text-gray-300">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Salud Quibdó. Todos los derechos reservados.
            </div>
            
            {/* Compliance badges */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                Ley 1581/2012 Compliant
              </div>
              <div className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                Datos Seguros
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>
              Salud Quibdó cumple con la Ley 1581 de 2012 sobre protección de datos personales. 
              Esta plataforma no está diseñada para recopilar información personal sensible sin consentimiento.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}