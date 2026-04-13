import { useState } from "react";
import adaptaLogo from "@/assets/adapta-logo.png";
import maracofLogo from "@/assets/logo_maracof.png";

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Introduce email y contraseña");
      return;
    }
    onLogin();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#0f1f3a" }}
    >
      <div className="w-full max-w-[340px] flex flex-col items-center">
        {/* Maracof logo — large & prominent */}
        <img src={maracofLogo} alt="Maracof" className="h-24 mb-3 object-contain" />

        {/* Subtitle */}
        <div className="text-[14px] font-semibold mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
          ParteDigital · PSFV San Pedro
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
              onFocus={e => e.target.style.borderColor = "#007C58"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-lg text-[14px] outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
              onFocus={e => e.target.style.borderColor = "#007C58"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
          </div>

          {error && (
            <div className="text-[12px] text-center" style={{ color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg text-[14px] font-bold border-none cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: "#007C58", color: "#fff" }}
          >
            Iniciar sesión
          </button>
        </form>

        {/* Powered by Adapta Build — subtle platform credit */}
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Powered by
          </div>
          <div className="flex items-center gap-1.5">
            <img src={adaptaLogo} alt="Adapta" className="w-5 h-5 opacity-50" />
            <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Adapta<span style={{ color: "rgba(0,124,88,0.6)" }}> Build</span>
            </span>
          </div>
          <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 Adapta Service Construction
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
