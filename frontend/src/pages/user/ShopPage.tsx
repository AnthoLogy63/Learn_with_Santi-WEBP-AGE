import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ShoppingBag, Trophy, ArrowLeft, CheckCircle2, Package, Gift, ShoppingCart } from "lucide-react";
import FondoCaja from "@/media/FondoCaja.webp";
import Mochila from "@/media/mochila.webp";
import PoloResaltadores from "@/media/polos-cartucheras-resaltadores.webp";
import Agenda_Lapiceros from "@/media/agenda+5 lapiceros.webp";
import TottebagProduct from "@/media/llavero antiestrés+totebag.webp";
import GorraMiBonitoTomatodo from "@/media/gorraYtomatodo.webp";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
}

const PRODUCTS: Product[] = [
    {
        id: 1,
        name: "MOCHILA + LLAVERO MI BONITO",
        description: "Incluye: 1 mochila + 1 llavero Mi Bonito. Mochila espaciosa y cómoda para uso diario. Colores sujetos a stock. Imagen referencial.",
        price: 1350,
        image: Mochila,
        category: "Productos"
    },
    {
        id: 2,
        name: "AGENDA + 5 LAPICEROS DE COLORES",
        description: "Incluye: 1 agenda + 5 lapiceros de colores. Ideal para organizar tus apuntes y escribir con estilo. Colores sujetos a stock. Imagen referencial.",
        price: 1250,
        image: Agenda_Lapiceros,
        category: "Productos"
    },
    {
        id: 3,
        name: "POLO + RESALTADORES + CARTUCHERA",
        description: "Incluye: 1 polo + resaltadores + 1 cartuchera. Kit práctico para estudio o trabajo diario. Colores sujetos a stock. Imagen referencial.",
        price: 1050,
        image: PoloResaltadores,
        category: "Productos"
    },
    {
        id: 4,
        name: "TOTTE BAG + LLAVERO MUÑECO ANTIESTRÉS",
        description: "Incluye: 1 totte bag + 1 llavero muñeco antiestrés. Totte bag espaciosa y práctica para uso diario. Colores sujetos a stock. Imagen referencial.",
        price: 850,
        image: TottebagProduct,
        category: "Productos"
    },
    {
        id: 5,
        name: "GORRA MI BONITO + TOMATODO",
        description: "Incluye: 1 gorra Mi Bonito + 1 tomatodo. Accesorios prácticos para el día a día. Colores sujetos a stock. Imagen referencial.",
        price: 850,
        image: GorraMiBonitoTomatodo,
        category: "Productos"
    }
];

const ShopPage = () => {
    const { user } = useAppContext();
    const navigate = useNavigate();
    const [redeemingId, setRedeemingId] = useState<number | null>(null);

    const handleRedeem = (product: Product) => {
        if ((user?.total_score || 0) < product.price) {
            toast.error("Puntos insuficientes para canjear este producto.");
            return;
        }

        setRedeemingId(product.id);

        // Simulate API call
        setTimeout(() => {
            setRedeemingId(null);
            toast.success(`¡Solicitud enviada! Pronto te contactaremos para la entrega de tu ${product.name}.`, {
                description: "Esta es una simulación del proceso de canje.",
                duration: 5000,
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col relative">
            {/* Header Fijo */}
            <header className="sticky top-0 z-50 bg-[#001c4d] text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-[10px] sm:text-sm font-bold text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden xs:inline">Volver</span>
                    </button>

                    <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-white/20 backdrop-blur-md">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 leading-none text-white/70">Puntos</span>
                            <span className="text-sm sm:text-xl font-black tabular-nums">{user?.total_score || 0}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section - Más Compacto */}
            <section className="relative py-10 sm:py-16 bg-[#001c4d] overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${FondoCaja})`, backgroundSize: 'cover' }}></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-2xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[9px] font-black uppercase tracking-widest mb-3">
                            <ShoppingBag className="h-3 w-3" />
                            Tienda de Recompensas
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                            Tienda de <span className="text-[#09B3B3]">Santi</span>
                        </h1>
                        <p className="text-sm sm:text-base text-white/60 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                            Canjea tus puntos por productos exclusivos. Tu esfuerzo tiene recompensa.
                        </p>
                    </div>
                    <div className="hidden lg:block w-32 h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-3xl">
                        <Gift className="h-12 w-12 text-white/20 animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#001c4d]" />
                        Catálogo de Productos
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden p-2">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-[#001c4d] transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-[11px] text-slate-400 mb-4 flex-1 leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 min-w-[50px]">
                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="text-base font-black text-[#001c4d] tracking-tight">{product.price}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRedeem(product)}
                                        disabled={redeemingId !== null}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${redeemingId === product.id
                                            ? "bg-emerald-500 text-white cursor-wait"
                                            : "bg-[#09B3B3] text-white hover:bg-[#079191] active:scale-95 shadow-sm"
                                            }`}
                                    >
                                        {redeemingId === product.id ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 animate-bounce" />
                                        ) : (
                                            <>
                                                <ShoppingCart className="h-3.5 w-3.5" />
                                                Canjear
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Informacional */}
            <footer className="bg-slate-100 border-t border-slate-200 py-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
                        Learning with Santi • {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ShopPage;
