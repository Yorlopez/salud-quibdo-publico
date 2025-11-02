import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Calendar, Clock, Stethoscope } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import type { User } from "../types";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  is_online: boolean;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function AppointmentModal({ isOpen, onClose, user: _user }: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available doctors when modal opens
  useEffect(() => {
    if (isOpen && isSupabaseConfigured) {
      fetchDoctors();
    } else if (isOpen && !isSupabaseConfigured) {
      // Show demo doctors for UI testing
      setDoctors([
        {
          id: "demo-1",
          name: "Dr. María González",
          specialization: "Medicina General",
          is_online: true
        },
        {
          id: "demo-2",
          name: "Dr. Carlos Ramírez",
          specialization: "Pediatría",
          is_online: false
        },
        {
          id: "demo-3",
          name: "Dra. Ana Vélez",
          specialization: "Ginecología",
          is_online: true
        }
      ]);
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      if (!isSupabaseConfigured || !supabase) return;
      
      const url = `https://${projectId}.supabase.co`;
      // CORREGIDO: Apunta a la nueva función 'api' (asumiendo que tienes una ruta '/doctors/available')
      const response = await fetch(`${url}/functions/v1/api/doctors/available`, {
        headers: {
          "apikey": publicAnonKey,
          "Authorization": `Bearer ${publicAnonKey}`
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured) {
      setError("La plataforma aún no está configurada completamente. Esta es una demostración.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const doctor_id = formData.get("doctor_id") as string;
    const appointment_date = formData.get("appointment_date") as string;
    const appointment_time = formData.get("appointment_time") as string;
    const symptoms = formData.get("symptoms") as string;
    const urgency_level = formData.get("urgency_level") as string;

    // Combine date and time
    const combinedDateTime = `${appointment_date}T${appointment_time}:00.000Z`;

    try {
      if (!supabase) return;
      
      const url = `https://${projectId}.supabase.co`;
      const { data: { session } } = await supabase.auth.getSession();
      
      // CORREGIDO: Apunta a la nueva función 'api' (asumiendo que tienes una ruta '/appointments/create')
      const response = await fetch(`${url}/functions/v1/api/appointments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": publicAnonKey,
          "Authorization": `Bearer ${session?.access_token || publicAnonKey}` // Usa el token del usuario si está disponible
        },
        body: JSON.stringify({
          doctor_id,
          appointment_date: combinedDateTime,
          symptoms,
          urgency_level
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al agendar la cita");
      }

      setSuccess("¡Cita agendada exitosamente! El médico se pondrá en contacto contigo.");
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);

    } catch (error) {
      console.log("Appointment creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al agendar la cita";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Agendar Consulta Virtual
          </DialogTitle>
          <DialogDescription>
            Programa tu cita con uno de nuestros médicos voluntarios
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-4">
            <Label>Selecciona un médico</Label>
            <div className="grid gap-3 max-h-48 overflow-y-auto">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-gray-600">{doctor.specialization}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${doctor.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600">
                          {doctor.is_online ? 'En línea' : 'Fuera de línea'}
                        </span>
                        <input
                          type="radio"
                          name="doctor_id"
                          value={doctor.id}
                          required
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointment_date">Fecha de la cita</Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                min={minDate}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointment_time">Hora preferida</Label>
              <Select name="appointment_time" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <Label htmlFor="symptoms">Síntomas o motivo de consulta</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              placeholder="Describe brevemente tus síntomas o el motivo de la consulta..."
              required
              className="min-h-[100px]"
            />
          </div>

          {/* Urgency Level */}
          <div>
            <Label htmlFor="urgency_level">Nivel de urgencia</Label>
            <Select name="urgency_level" required>
              <SelectTrigger>
                <SelectValue placeholder="¿Qué tan urgente es tu consulta?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja - Consulta de rutina</SelectItem>
                <SelectItem value="medium">Media - Síntomas molestos</SelectItem>
                <SelectItem value="high">Alta - Síntomas preocupantes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Información importante:</div>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Las consultas virtuales duran aproximadamente 20-30 minutos</li>
                    <li>• Recibirás un enlace de videollamada por correo electrónico</li>
                    <li>• Ten a mano tus medicamentos actuales si los tienes</li>
                    <li>• Para emergencias médicas, dirígete al hospital más cercano</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              {success}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Agendando..." : "Agendar Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}