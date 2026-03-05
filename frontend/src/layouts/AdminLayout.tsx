import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import AdminProfile from "@/components/admin/AdminProfile";
import Logo from "@/media/logo.webp";
import FondoCaja from "@/media/FondoCaja.webp";

const AdminLayout = () => {
    // We lift the state here so both Sidebar and Main Content know what's active
    const [activeTab, setActiveTab] = useState("management");
    const { isAuthenticated, user } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/", { replace: true });
        } else if (user && !user.is_staff) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || (user && !user.is_staff)) return null;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[#001c4d] lg:overflow-hidden text-white font-inter"
            style={{
                backgroundImage: `url(${FondoCaja})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            {/* Sidebar */}
            <aside className="w-full lg:w-96 border-b lg:border-r border-white/10 bg-slate-50/95 backdrop-blur-2xl flex-shrink-0 flex flex-col shadow-2xl">
                <div className="w-full bg-white flex items-center justify-center border-b-2 border-gray-300">
                    <img src={Logo} alt="Logo" className="w-48 h-auto object-contain" />
                </div>

                <div className="p-6 px-10 lg:flex-1 lg:overflow-y-auto">
                    <AdminProfile activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:overflow-y-auto bg-black/10 backdrop-blur-[2px]">
                {/* We pass the activeTab to the Outlet using context */}
                <Outlet context={{ activeTab }} />
            </main>
        </div>
    );
};

export default AdminLayout;
