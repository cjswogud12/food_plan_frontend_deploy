"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function CallbackContent() {
    const params = useSearchParams()
    const router = useRouter()

    const name = params.get("name") || "사용자"
    const email = params.get("email") || ""

    const handleConfirm = () => {
        router.push("/")
    }

    return (
        <main className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-purple-50 to-white">
            <div className="flex flex-col items-center w-full max-w-[360px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
                {/* 환영 아이콘 */}
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🎉</span>
                </div>

                {/* 환영 메시지 */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    환영합니다!
                </h1>
                <p className="text-lg font-medium text-purple-600 mb-1">
                    {name}님
                </p>
                {email && (
                    <p className="text-sm text-gray-500 mb-6">
                        {email}
                    </p>
                )}

                {/* 설명 */}
                <p className="text-sm text-gray-600 text-center mb-8">
                    구글 계정으로 로그인되었습니다.<br />
                </p>

                {/* 확인 버튼 */}
                <button
                    onClick={handleConfirm}
                    className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg hover:bg-purple-600 active:scale-[0.98] transition-all"
                >
                    확인
                </button>
            </div>
        </main>
    )
}

export default function LoginCallbackPage() {
    return (
        <Suspense fallback={
            <main className="flex w-full h-screen justify-center items-center">
                <p>로딩 중...</p>
            </main>
        }>
            <CallbackContent />
        </Suspense>
    )
}
