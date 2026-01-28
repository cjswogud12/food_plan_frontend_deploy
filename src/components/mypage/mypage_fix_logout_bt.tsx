"use client"

export default function MypageFixLogoutbt() {
    return (
        <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
            회원정보수정
            </button>
            <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
            로그아웃
            </button>
        </div>
    )
}