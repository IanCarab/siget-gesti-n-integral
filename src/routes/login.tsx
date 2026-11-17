import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_ICONS } from "@/components/siget/AppShell";
import { ROLES } from "@/lib/siget/roles";
import { useSiget } from "@/lib/siget/store";
import type { RoleId } from "@/lib/siget/types";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Siget | Gestión de tecnología y servicio técnico" },
    { name: "description", content: "Panel de gestión para ventas, inventario y reparaciones de computadoras." },
    { property: "og:title", content: "Siget | Gestión de tecnología y servicio técnico" },
    { property: "og:description", content: "Panel de gestión para ventas, inventario y reparaciones de computadoras." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LoginPage,
});

const ALL_ROLES: RoleId[] = ["admin", "vendedor", "tecnico", "deposito"];

function LoginPage() {
  const { setRole } = useSiget();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleId>("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !password.trim()) return;
    setRole(selectedRole);
    navigate({ to: ROLES[selectedRole].home });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="h-1.5 bg-primary" />
      <header className="px-7 lg:px-12 py-7 flex items-center justify-between">
        <Brand />
        <span className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-success" /> Sistema local · Modo demostración
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 pb-16 pt-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-9 text-center">
            <div className="mx-auto mb-6 size-14 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
              <Monitor size={27} strokeWidth={1.8} />
            </div>
            <h1 className="text-[29px] font-bold text-foreground">Bienvenido a Siget</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ingresá a tu espacio de trabajo</p>
          </div>

          <div className="app-panel p-7 sm:p-9 shadow-[0_16px_48px_-30px_var(--foreground)]">
            <div className="mb-7">
              <h2 className="text-lg font-bold">Iniciar sesión</h2>
              <p className="mt-1 text-xs text-muted-foreground">Accedé al sistema de gestión</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="user" className="app-label block mb-2">Usuario</label>
                <Input
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Ingresá tu usuario"
                  required
                  className="h-11 bg-surface"
                />
              </div>
              <div>
                <label htmlFor="password" className="app-label block mb-2">Contraseña</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresá tu contraseña"
                    required
                    className="h-11 bg-surface pr-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 size-9 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-sm mt-1">
                Ingresar <ArrowRight size={16} />
              </Button>
            </form>

            <div className="border-t mt-8 pt-6">
              <p className="app-kicker text-center mb-4">Elegí tu rol</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_ROLES.map((r) => {
                  const Icon = ROLE_ICONS[r];
                  const info = ROLES[r];
                  const active = selectedRole === r;
                  return (
                    <Button
                      key={r}
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedRole(r)}
                      className={`h-auto py-3 px-2 flex-col gap-2 border ${
                        active
                          ? "border-primary bg-soft-blue text-primary"
                          : "border-transparent text-muted-foreground hover:border-border"
                      }`}
                    >
                      <span
                        className={`size-9 rounded-full flex items-center justify-center ${
                          active ? "bg-card" : "bg-secondary"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {info.titulo}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Vista de demostración · Ingresá cualquier usuario y contraseña
          </p>
        </div>
      </div>

      <footer className="px-7 lg:px-12 py-5 flex justify-between text-[11px] text-muted-foreground border-t">
        <span>© 2026 Siget</span>
        <span>Gestión simple para tu negocio</span>
      </footer>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="size-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
        <Monitor size={20} strokeWidth={2.1} />
      </div>
      <div className="leading-none">
        <div className="text-xl font-extrabold text-foreground">
          siget<span className="text-primary">.</span>
        </div>
        <div className="text-[9px] font-bold tracking-[.15em] text-muted-foreground mt-1">
          GESTIÓN TECNOLÓGICA
        </div>
      </div>
    </div>
  );
}
