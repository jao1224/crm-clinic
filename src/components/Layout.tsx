import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Calendar, 
  DollarSign,
  Settings,
  Activity,
  LogOut,
  Shield,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Painel", href: "/", icon: LayoutDashboard, allowedRoles: ["admin", "dentist", "receptionist", "viewer"] as UserRole[] },
  { name: "Pacientes", href: "/patients", icon: Users, allowedRoles: ["admin", "dentist", "receptionist"] as UserRole[] },
  { name: "Dentistas", href: "/dentists", icon: UserCog, allowedRoles: ["admin", "dentist", "receptionist"] as UserRole[] },
  { name: "Consultas", href: "/appointments", icon: Calendar, allowedRoles: ["admin", "dentist", "receptionist"] as UserRole[] },
  { name: "Finanças", href: "/finances", icon: DollarSign, allowedRoles: ["admin"] as UserRole[] },
  { name: "Gerenciamento de Usuários", href: "/users", icon: Shield, allowedRoles: ["admin"] as UserRole[] },
  { name: "Histórico", href: "/history", icon: History, allowedRoles: ["admin"] as UserRole[] },
  { name: "Configurações", href: "/settings", icon: Settings, allowedRoles: ["admin"] as UserRole[] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavigation = navigation.filter((item) =>
    currentUser && item.allowedRoles.includes(currentUser.role)
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <img src="/logo.svg" alt="DentalCare Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold text-foreground">DentalCare</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento da Clínica</p>
          </div>
        </div>
        
        <nav className="space-y-1 p-4 flex-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
