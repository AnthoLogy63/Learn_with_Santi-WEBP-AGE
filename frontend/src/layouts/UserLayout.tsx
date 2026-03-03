import React from "react";
import { Outlet } from "react-router-dom";
import UserProfile from "@/components/user/UserProfile";
import Logo from "@/media/logo.webp";
import FondoCaja from "@/media/FondoCaja.webp";

const UserLayout = () => {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[#001c4d] lg:overflow-hidden text-white font-inter"
            style={{
                backgroundImage: `url(${FondoCaja})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}
        >
            {/* Sidebar - Top on mobile, Left on desktop */}
            <aside className="w-full lg:w-96 border-b lg:border-r border-white/10 bg-slate-50/95 backdrop-blur-2xl flex-shrink-0 flex flex-col shadow-2xl">
                {/* Logo grande centrado con fondo blanco */}
                <div className="w-full bg-white flex items-center justify-center border-b-2 border-gray-300">
                    <img src={Logo} alt="Logo" className="w-48 h-auto object-contain" />
                </div>

                {/* Perfil de usuario */}
                <div className="p-6 px-10 lg:flex-1 lg:overflow-y-auto">
                    <UserProfile />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:overflow-y-auto bg-black/10 backdrop-blur-[2px]">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
