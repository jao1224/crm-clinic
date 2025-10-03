import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Label } from "@/components/ui/label";
import { useLocation } from "react-router-dom";

interface Appointment {
  id: number;
  patient_id: number;
  dentist_id: number;
  appointment_date: string;
  type: string;
  notes: string;
  status: string;
}

interface Patient {
  id: number;
  name: string;
}

interface Dentist {
  id: number;
  name: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDentistId, setSelectedDentistId] = useState<string>("");
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDentists();

    const queryParams = new URLSearchParams(location.search);
    const dentistIdFromUrl = queryParams.get('dentistId');
    if (dentistIdFromUrl) {
      setSelectedDentistId(dentistIdFromUrl);
    }
  }, [location.search]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar agendamentos", variant: "destructive" });
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar pacientes", variant: "destructive" });
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/dentists');
      if (response.ok) {
        const data = await response.json();
        setDentists(data);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar dentistas", variant: "destructive" });
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "Desconhecido";
  };

  const getDentistName = (dentistId: number) => {
    const dentist = dentists.find((d) => d.id === dentistId);
    return dentist ? dentist.name : "Desconhecido";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success hover:bg-success/20";
      case "pending":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date);
    const isSameDay = selectedDate ? appointmentDate.toDateString() === selectedDate.toDateString() : true;
    const isSelectedDentist = selectedDentistId ? appointment.dentist_id === parseInt(selectedDentistId) : true;
    return isSameDay && isSelectedDentist;
  }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Agendamentos</h1>
            <p className="mt-1 text-primary-foreground/80">Agende e gerencie os agendamentos</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Calendar View */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Visualização do Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mx-auto"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dentist-filter">Filtrar por Dentista</Label>
                <select
                  id="dentist-filter"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={selectedDentistId}
                  onChange={(e) => setSelectedDentistId(e.target.value)}
                >
                  <option value="">Todos os Dentistas</option>
                  {dentists.map(dentist => (
                    <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Agendamentos para {selectedDate?.toLocaleDateString("pt-BR") || "hoje"}</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{getPatientName(appointment.patient_id)}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type} com {getDentistName(appointment.dentist_id)}</p>
                        </div>
                        <p className="text-sm font-medium">{`${new Date(appointment.appointment_date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">Nenhum agendamento para esta data/dentista.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Todos os Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-xs font-medium text-primary">
                        {new Date(appointment.appointment_date).toLocaleDateString("pt-BR", { month: "short" })}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {new Date(appointment.appointment_date).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{getPatientName(appointment.patient_id)}</h3>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {`${new Date(appointment.appointment_date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4" />
                          {getDentistName(appointment.dentist_id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {appointment.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reagendar
                    </Button>
                    <Button variant="default" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
