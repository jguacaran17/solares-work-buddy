import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardHat, Sun } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: 'foreman' | 'boss') => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: boss@adapta.com logs as boss, anyone else as foreman
    if (email.includes("jefe") || email.includes("boss")) {
      onLogin("boss");
    } else {
      onLogin("foreman");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
          <Sun className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          Adapta Build
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de partes de trabajo
        </p>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-background"
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 font-semibold text-sm">
            <HardHat className="w-4 h-4 mr-2" />
            Iniciar sesión
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo: usa <span className="font-medium">jefe@adapta.com</span> para vista jefe
        </p>
      </form>
    </div>
  );
};

export default LoginScreen;
