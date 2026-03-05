import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Lock, User } from "lucide-react";
import Logo from "@/media/logo.webp";
import Santigif from "@/media/santi.gif";
import FondoCaja from "@/media/FondoCaja.webp";
import LogoCaja from "@/media/logocaja.gif";

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
      // Get user from local storage to check role (AppContext might not have it yet in the same tick)
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (savedUser.is_staff) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#001c4d] px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${FondoCaja})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* CONTENEDOR CENTRAL */}
      <div className="relative z-10 flex animate-fade-in">

        {/* CARTILLA LOGIN */}
        <div className="w-[380px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-l-3xl p-8 shadow-2xl">

          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-2xl mb-6 shadow-lg">
              <img
                src={Logo}
                alt="Logo"
                className="w-40 h-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-black text-white">
              Iniciar sesión
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5 ml-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-5 pr-4 py-3 rounded-xl border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5 ml-1">
                DNI (Contraseña)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="password"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingrese su DNI"
                  className="w-full pl-5 pr-4 py-3 rounded-xl border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-bold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-4 rounded-xl 
                      bg-[#09B3B3] text-white font-black text-sm
                      shadow-lg
                      hover:bg-[#0ac2c2]
                      hover:shadow-[0_8px_25px_rgba(9,179,179,0.45)]
                      transition-all duration-300 ease-out
                      disabled:opacity-50 disabled:hover:translate-y-0
                      active:scale-95"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="h-[480px] bg-white rounded-r-3xl shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="relative h-[480px] w-[410px] rounded-r-3xl overflow-hidden">
            
            <img
              src={Santigif}
              alt="Santi"
              className="h-full w-full object-cover drop-shadow-xl"
            />

            <div className="absolute top-3 right-3 bg-white rounded-full shadow-lg">
              <img
                src={LogoCaja}
                alt="Logo Caja"
                className="h-[70px] w-[70px] object-contain"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;