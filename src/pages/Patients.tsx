import { useState, useEffect } from "react";
import { Search, UserPlus, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: string;
}

interface Dentist {
  id: number;
  name: string;
  specialty: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
    fetchDentists();
  }, []);

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

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatient = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: "Paciente adicionado com sucesso" });
        setIsNewPatientOpen(false);
        fetchPatients();
      } else {
        const errorData = await response.json();
        toast({ title: "Erro", description: errorData.message || "Falha ao adicionar paciente", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao adicionar paciente", variant: "destructive" });
    }
  };

  const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const appointmentData = {
      ...Object.fromEntries(formData.entries()),
      patient_id: selectedPatient?.id,
      status: 'pending', // Default status
    };

    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: "Consulta agendada com sucesso" });
        setIsBookAppointmentOpen(false);
      } else {
        const errorData = await response.json();
        toast({ title: "Erro", description: errorData.message || "Falha ao agendar consulta", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao agendar consulta", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Gerenciamento de Pacientes</h1>
            <p className="mt-1 text-primary-foreground/80">Visualize e gerencie todos os prontuários de pacientes</p>
          </div>
          <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-card text-primary hover:bg-card/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Paciente</DialogTitle>
                <DialogDescription>Insira as informações do paciente para criar um novo prontuário</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" name="name" required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" required placeholder="john@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" required placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" name="cpf" required placeholder="123.456.789-00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" placeholder="123 Main St, City, State" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical_history">Histórico Médico</Label>
                  <Textarea id="medical_history" name="medical_history" placeholder="Alergias, condições, medicamentos..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewPatientOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar Paciente</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar pacientes por nome ou e-mail..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="transition-all hover:shadow-lg animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                      {patient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <span className="inline-block rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {patient.phone}
                  </div>
                  <div className="pt-2 text-sm">
                    <span className="text-muted-foreground">Última Visita: </span>
                    <span className="font-medium text-foreground">{patient.lastVisit}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Dialog open={isViewDetailsOpen && selectedPatient?.id === patient.id} onOpenChange={(open) => {
                    setIsViewDetailsOpen(open);
                    if (!open) setSelectedPatient(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalhes do Paciente</DialogTitle>
                        <DialogDescription>Informações completas de {patient.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-xl">
                            {patient.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{patient.name}</h3>
                            <span className="inline-block rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                              {patient.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">Última Visita</p>
                            <p className="font-medium">{patient.lastVisit}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isBookAppointmentOpen && selectedPatient?.id === patient.id} onOpenChange={(open) => {
                    setIsBookAppointmentOpen(open);
                    if (!open) setSelectedPatient(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        Agendar Consulta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agendar Consulta</DialogTitle>
                        <DialogDescription>Agende uma consulta para {patient.name}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBookAppointment} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="appointment_date">Data e Hora da Consulta</Label>
                          <Input id="appointment_date" name="appointment_date" type="datetime-local" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dentist_id">Selecionar Dentista</Label>
                          <select id="dentist_id" name="dentist_id" required className="w-full rounded-md border border-input bg-background px-3 py-2">
                            <option value="">Escolha um dentista</option>
                            {dentists.map(dentist => (
                              <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Tipo de Consulta</Label>
                          <select id="type" name="type" required className="w-full rounded-md border border-input bg-background px-3 py-2">
                            <option value="">Selecione o tipo</option>
                            <option value="checkup">Check-up Regular</option>
                            <option value="cleaning">Limpeza Dental</option>
                            <option value="filling">Obturação</option>
                            <option value="extraction">Extração</option>
                            <option value="emergency">Emergência</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea id="notes" name="notes" placeholder="Requisitos especiais ou observações..." />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsBookAppointmentOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar Consulta
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
