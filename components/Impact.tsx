import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Card, CardContent } from "./ui/card";
import { Quote } from "lucide-react";

export function Impact() {
  const testimonials = [
    {
      name: "María Rodríguez",
      role: "Paciente",
      content: "Pude consultar con un médico sin tener que viajar horas hasta Medellín. Me ayudaron con mi diabetes.",
      avatar: "https://images.unsplash.com/photo-1533734635438-fa92e72a1f0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYW4lMjBjb21tdW5pdHklMjBwZW9wbGUlMjBzbWlsaW5nfGVufDF8fHx8MTc1NzEyNDEyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Carlos Mosquera",
      role: "Padre de familia",
      content: "El chatbot me ayudó a saber qué hacer cuando mi hija tenía fiebre. Muy útil para emergencias.",
      avatar: "https://images.unsplash.com/photo-1587557983735-f05198060b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwd29ya2VyJTIwbWVkaWNhbCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTcxMjQxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      name: "Dr. Ana Vélez",
      role: "Médico voluntario",
      content: "Es gratificante poder ayudar a mi comunidad desde cualquier lugar. La plataforma es muy fácil de usar.",
      avatar: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZWR1Y2F0aW9uJTIwaGVhbHRoJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzU3MTI0MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const stats = [
    { number: "500+", label: "Consultas realizadas" },
    { number: "50+", label: "Médicos voluntarios" },
    { number: "15", label: "Comunidades atendidas" },
    { number: "95%", label: "Satisfacción del usuario" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Transformando la salud en Quibdó
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de personas ya confían en nosotros para cuidar su salud y la de sus familias
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <ImageWithFallback
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map representation */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Cobertura en el Chocó
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">Q</span>
              </div>
              <h4 className="font-semibold text-gray-900">Quibdó Centro</h4>
              <p className="text-sm text-gray-600">Cobertura completa</p>
            </div>
            <div className="p-4">
              <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <h4 className="font-semibold text-gray-900">Zonas Rurales</h4>
              <p className="text-sm text-gray-600">Servicio móvil</p>
            </div>
            <div className="p-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <h4 className="font-semibold text-gray-900">Comunidades</h4>
              <p className="text-sm text-gray-600">En expansión</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}