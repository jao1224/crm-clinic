import { Settings as SettingsIcon, Building, Users, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const settingsSections = [
    {
      icon: Building,
      title: "Informações da Clínica",
      description: "Atualize os detalhes da clínica, endereço e informações de contato",
    },
    {
      icon: Users,
      title: "Gerenciamento de Usuários",
      description: "Gerencie as contas da equipe e as permissões de acesso",
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Defina as configurações de notificação por e-mail e SMS",
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Políticas de senha e autenticação de dois fatores",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">Configurações</h1>
            <p className="mt-1 text-primary-foreground/80">Gerencie a configuração e as preferências da clínica</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {settingsSections.map((section) => (
            <Card key={section.title} className="transition-all hover:shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{section.description}</p>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Settings */}
        <Card className="mt-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-foreground">Versão</span>
                <span className="text-sm text-muted-foreground">1.0.0</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-foreground">Último Backup</span>
                <span className="text-sm text-muted-foreground">2024-10-01 08:30 AM</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-foreground">Tamanho do Banco de Dados</span>
                <span className="text-sm text-muted-foreground">245 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Usuários Ativos</span>
                <span className="text-sm text-muted-foreground">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
