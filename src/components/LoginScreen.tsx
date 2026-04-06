import { useState } from "react";
import adaptaLogo from "@/assets/adapta-logo.png";

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
        {/* Logo */}
        <img src={adaptaLogo} alt="Adapta Logo" className="w-20 h-20 mb-4" />

        {/* Brand */}
        <div className="text-[28px] font-bold tracking-tight mb-1">
          <span className="text-white">Adapta</span>
          <span style={{ color: "#2fb7a4" }}> Build</span>
        </div>

        {/* Subtitle */}
        <div className="text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
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
              onFocus={e => e.target.style.borderColor = "#2fb7a4"}
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
              onFocus={e => e.target.style.borderColor = "#2fb7a4"}
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
            style={{ background: "#2fb7a4", color: "#fff" }}
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 Adapta Service Construction
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
