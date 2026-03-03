import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Lock, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !dni) {
      setError("Por favor, complete todos los campos.");
      return;
    }
    const success = await login(username, dni);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#001c4d] text-white text-2xl font-bold mb-4 shadow-lg">
            MB
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mi Bonito</h1>
          <p className="text-muted-foreground mt-1 text-sm">Plataforma de evaluación</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-foreground mb-1.5">
                DNI (Contraseña)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="dni"
                  type="password"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingrese su DNI"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium animate-fade-in">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[#001c4d] text-white font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 shadow-md"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Credenciales de prueba: <span className="font-medium">jperez</span> / <span className="font-medium">12345678</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
