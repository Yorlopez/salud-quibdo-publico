import { Video, FileText, MessageCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function Services() {
  const services = [
    {
      icon: <Video className="h-8 w-8 text-blue-600" />,
      title: "Consultas Virtuales",
      description: "Habla con médicos desde tu celular o computadora",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Historial Médico Digital",
      description: "Tus datos seguros y accesibles en un solo lugar",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
      title: "Chatbot de Salud",
      description: "Recibe consejos y triage inicial 24/7",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-orange-600" />,
      title: "Educación en Salud",
      description: "Aprende a prevenir y cuidar tu bienestar",
      color: "bg-orange-50 border-orange-200"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            ¿Qué ofrecemos?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Servicios de salud diseñados especialmente para la comunidad de Quibdó y sus alrededores
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`${service.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  {service.icon}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Adaptado para nuestra comunidad
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todos nuestros servicios están diseñados considerando las necesidades específicas 
              de Quibdó y el Chocó, incluyendo conectividad limitada y contexto cultural local.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}