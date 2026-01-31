
"use client"
import { useRouter } from "next/navigation"
import { logout } from "@/api/index"

export default function MypageFixLogoutbt() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout();
            // 로그아웃 성공 후 처리
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_number");
            localStorage.removeItem("username"); // 혹시 저장했다면 
            alert("로그아웃 되었습니다.");
            router.push("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
                회원정보수정
            </button>
            <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
                로그아웃
            </button>
        </div>
    )
}