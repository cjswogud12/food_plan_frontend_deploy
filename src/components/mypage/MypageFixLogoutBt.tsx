
"use client"
import { useRouter } from "next/navigation"
import { logout } from "@/api/index"

export default function MypageFixLogoutbt() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout();
            // 로그아웃 성공 후 처리
            localStorage.clear();
            sessionStorage.clear();
            alert("로그아웃 되었습니다.");
            router.push("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div className="flex gap-3">
            <button className="flex-1 py-3 bg-indigo-300 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-400 transition-all">
                회원정보수정
            </button>
            <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all">
                로그아웃
            </button>
        </div>
    )
}