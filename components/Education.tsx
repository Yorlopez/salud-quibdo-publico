import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Play, Download, Clock, Users } from "lucide-react";

export function Education() {
  const resources = [
    {
      title: "Prevención de la Hipertensión",
      description: "Aprende a controlar tu presión arterial con hábitos saludables",
      type: "Video",
      duration: "15 min",
      participants: "1,234",
      image: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZWR1Y2F0aW9uJTIwaGVhbHRoJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzU3MTI0MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      icon: <Play className="h-5 w-5" />
    },
    {
      title: "Manejo de la Diabetes",
      description: "Guía completa para vivir bien con diabetes en nuestro clima tropical",
      type: "PDF",
      duration: "Lectura 10 min",
      participants: "856",
      image: "https://images.unsplash.com/photo-1587557983735-f05198060b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwd29ya2VyJTIwbWVkaWNhbCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTcxMjQxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      icon: <Download className="h-5 w-5" />
    },
    {
      title: "Higiene y Prevención",
      description: "Medidas básicas de higiene para prevenir enfermedades comunes",
      type: "Interactivo",
      duration: "20 min",
      participants: "2,103",
      image: "https://images.unsplash.com/photo-1533734635438-fa92e72a1f0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYW4lMjBjb21tdW5pdHklMjBwZW9wbGUlMjBzbWlsaW5nfGVufDF8fHx8MTc1NzEyNDEyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      icon: <Play className="h-5 w-5" />
    }
  ];

  const topics = [
    "Enfermedades tropicales",
    "Nutrición familiar",
    "Salud materno-infantil",
    "Primeros auxilios",
    "Salud mental",
    "Medicina tradicional"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Cuida tu salud hoy
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recursos educativos gratuitos diseñados específicamente para las necesidades 
            de salud de nuestra región
          </p>
        </div>

        {/* Featured Resources */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {resource.type}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {resource.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {resource.participants}
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  {resource.icon}
                  <span className="ml-2">Acceder</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="bg-green-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Temas disponibles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <span className="text-gray-700 font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-semibold mb-4">
            ¿Necesitas consejos de salud ahora?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nuestro chatbot inteligente está disponible 24/7 para responder tus preguntas 
            básicas de salud y orientarte sobre cuándo buscar atención médica.
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Hablar con el Chatbot
          </Button>
        </div>
      </div>
    </section>
  );
}