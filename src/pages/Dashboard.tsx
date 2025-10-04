import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, Activity, Clock, UserPlus, Phone } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

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
  phone?: string;
}

interface PresentDentist extends Dentist {
  start_time: string;
  end_time: string;
}

interface Finance {
  id: number;
  patient_id: number;
  description: string;
  amount: number;
  date: string;
  type: string;
}

export default function Dashboard() {
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [activeDentists, setActiveDentists] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [isDentistModalOpen, setIsDentistModalOpen] = useState(false);
  const [presentDentists, setPresentDentists] = useState<PresentDentist[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    fetchActiveDentistsToday();
  }, []);

  const fetchActiveDentistsToday = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/dentists/active-today');
      if (response.ok) {
        const data: PresentDentist[] = await response.json();
        setPresentDentists(data);
        const uniqueDentists = new Set(data.map(d => d.id));
        setActiveDentists(uniqueDentists.size);
      } else {
        toast({ title: "Erro", description: "Falha ao buscar dentistas presentes", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de Rede", description: "Não foi possível conectar ao servidor para buscar dentistas.", variant: "destructive" });
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch Patients
      const patientsResponse = await fetch('http://localhost:3000/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
        setTotalPatients(patientsData.length);
      }

      // Fetch Dentists
      const dentistsResponse = await fetch('http://localhost:3000/api/dentists');
      if (dentistsResponse.ok) {
        const dentistsData = await dentistsResponse.json();
        setDentists(dentistsData);
      }

      // Fetch Appointments
      const appointmentsResponse = await fetch('http://localhost:3000/api/appointments');
      if (appointmentsResponse.ok) {
        const appointmentsData: Appointment[] = await appointmentsResponse.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filteredTodayAppointments = appointmentsData.filter(app => {
          const appDate = new Date(app.appointment_date);
          return appDate >= today && appDate < tomorrow;
        });
        setTodayAppointments(filteredTodayAppointments.length);

        const filteredUpcomingAppointments = appointmentsData.filter(app => {
          const appDate = new Date(app.appointment_date);
          return appDate >= today;
        }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
        setUpcomingAppointments(filteredUpcomingAppointments);
      }

      // Fetch Finances
      const financesResponse = await fetch('http://localhost:3000/api/finances');
      if (financesResponse.ok) {
        const financesData: Finance[] = await financesResponse.json();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyIncome = financesData
          .filter(f => new Date(f.date).getMonth() === currentMonth && new Date(f.date).getFullYear() === currentYear && f.type === 'income')
          .reduce((sum, f) => sum + f.amount, 0);
        setMonthlyRevenue(monthlyIncome);
      }

    } catch (error) {
      toast({ title: "Erro", description: "Falha ao buscar dados do painel", variant: "destructive" });
      console.error("Error fetching dashboard data:", error);
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

  const groupedPresentDentists = presentDentists.reduce((acc, dentist) => {
    let group = acc.find(d => d.id === dentist.id);
    if (!group) {
      group = { ...dentist, schedules: [] };
      acc.push(group);
    }
    group.schedules.push({ start_time: dentist.start_time, end_time: dentist.end_time });
    return acc;
  }, [] as (PresentDentist & { schedules: { start_time: string; end_time: string }[] })[]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3x1 font-bold text-primary-foreground">Painel</h1>
            <p className="mt-1 text-primary-foreground/80">Bem-vindo de volta! Aqui está a visão geral da sua clínica.</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-card text-primary hover:bg-card/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
            <Button className="bg-card text-primary hover:bg-card/90">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          {currentUser?.role !== 'receptionist' && (
            <StatCard
              title="Total de Pacientes"
              value={totalPatients.toString()}
              icon={Users}
              trend={{ value: "", positive: true }} // Trend data not available from backend yet
            />
          )}
            <StatCard
              title="Consultas de Hoje"
              value={todayAppointments.toString()}
              icon={Calendar}
              trend={{ value: "", positive: true }} // Trend data not available from backend yet
            />   
          {currentUser?.role === 'admin' && (
            <StatCard
              title="Receita Mensal"
              value={`R$${monthlyRevenue.toFixed(2)}`}
              icon={DollarSign}
              trend={{ value: "", positive: true }} // Trend data not available from backend yet
            />
          )}
          <Dialog open={isDentistModalOpen} onOpenChange={setIsDentistModalOpen}>
            <DialogTrigger asChild>
              <StatCard
                title="Dentistas Ativos"
                value={activeDentists.toString()}
                icon={Activity}
                trend={{ value: "", positive: true }}
              />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dentistas Presentes Hoje</DialogTitle>
                <DialogDescription>Lista de dentistas com horário de trabalho hoje.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {groupedPresentDentists.length > 0 ? (
                  groupedPresentDentists.map((dentist) => (
                    <div key={dentist.id} className="p-2 rounded-md border">
                      <h3 className="font-semibold text-lg">{dentist.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{dentist.phone}</span>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-sm mb-1">Horários:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {dentist.schedules.map((schedule, index) => (
                            <li key={index} className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum dentista presente hoje.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Próximos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{getPatientName(appointment.patient_id)}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{new Date(appointment.appointment_date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-sm text-muted-foreground">{getDentistName(appointment.dentist_id)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Novo Paciente
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Consulta
              </Button>
              {currentUser?.role !== 'receptionist' && (
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
              )}
              {currentUser?.role !== 'receptionist' && (
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Ver Relatórios
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
