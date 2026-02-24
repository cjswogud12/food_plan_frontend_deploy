
"use client"
import { useRouter } from "next/navigation"
import { logout, withdrawUser } from "@/api/index"
import { useUserStore, useDietStore, useInbodyStore } from "@/store"


export default function MypageFixLogoutbt() {
    const router = useRouter()

    // Store reset 함수들
    const resetUser = useUserStore((state) => state.resetUser);
    const resetDiet = useDietStore((state) => state.resetDiet);
    const resetInbody = useInbodyStore((state) => state.resetInbody);

    // 회원탈퇴 함수
    const handleWithdraw = async () => {
    if (!confirm("정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;
    
    try {
        const res = await withdrawUser();
        if (!res.ok) throw new Error("탈퇴 실패");
        
        // 탈퇴 성공 후 로컬 데이터 정리
        localStorage.clear();
        sessionStorage.clear();
        resetUser();
        resetDiet();
        resetInbody();
        
        alert("탈퇴가 완료되었습니다.");
        router.push("/login");
    } catch (error) {
        console.error("회원탈퇴 실패:", error);
        alert("회원탈퇴에 실패했습니다.");
    }
};

    const handleLogout = async () => {
        try {
            await logout();
            // 로그아웃 성공 후 처리
            localStorage.clear();
            sessionStorage.clear();

            // Zustand store 초기화
            resetUser();
            resetDiet();
            resetInbody();

            alert("로그아웃 되었습니다.");
            router.push("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
            alert("로그아웃에 실패했습니다.");
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={handleWithdraw}
                className="flex-1 py-3 bg-red-400 text-white rounded-xl font-bold shadow-sm hover:bg-red-500 transition-all">
                회원탈퇴
            </button>
            <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all">
                로그아웃
            </button>
        </div>
    )
}