"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "홈", icon: "house"},
        { href: "/record", label: "기록", icon: "list"},
        { href: "/mypage", label: "마이페이지", icon: "user"}
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return(
                  <Link
                        key={item.href}
                        href={item.href}
                        className={`bottom-nav-item ${isActive ? "active" : ""}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}