"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, List, User } from "lucide-react"

export default function BottomNav() {
    const pathname = usePathname();
    const navItems = [
        { href: "/", label: "홈", icon: House },
        { href: "/record", label: "기록", icon: List },
        { href: "/mypage", label: "마이페이지", icon: User }
    ];
    if (pathname === "/login" || pathname === "/register" || pathname === "/find-id" || pathname === "/find-password") return null;

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`transition-all duration-300 flex flex-col items-center justify-center w-full h-full pb-1 rounded-2xl ${isActive
                            ? "text-indigo-600 bg-indigo-50 shadow-sm scale-105 -translate-y-2"
                            : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <div className="p-1 mb-0.5">
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}