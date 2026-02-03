"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

function CallbackContent() {
    const params = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'welcome' | 'registering' | 'error'>('loading')
    const [message, setMessage] = useState('')

    const name = params.get("name") || "사용자"
    const email = params.get("email") || ""
    const provider = params.get("provider") || "google"

    useEffect(() => {
        const checkAndRegister = async () => {
            try {
                // 1. social-check API 호출
                const checkRes = await fetch(`${BASE_URL}/api/auth/social-check?email=${encodeURIComponent(email)}&provider=${provider}`, {
                    credentials: "include"
                })

                if (!checkRes.ok) {
                    throw new Error("소셜 체크 실패")
                }

                const checkData = await checkRes.json()

                if (checkData.registered) {
                    // 이미 등록된 사용자 -> localStorage 저장 후 메인으로
                    if (checkData.user_id) localStorage.setItem("user_id", checkData.user_id)
                    if (checkData.user_number) localStorage.setItem("user_number", String(checkData.user_number))
                    router.push("/")
                } else {
                    // 미등록 사용자 -> social-register 호출
                    setStatus('registering')

                    const registerRes = await fetch(`${BASE_URL}/api/auth/social-register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            email,
                            name,
                            provider
                        })
                    })

                    if (!registerRes.ok) {
                        throw new Error("소셜 회원가입 실패")
                    }

                    const registerData = await registerRes.json()

                    // 등록 완료 -> localStorage 저장 후 메인으로
                    if (registerData.user_id) localStorage.setItem("user_id", registerData.user_id)
                    if (registerData.user_number) localStorage.setItem("user_number", String(registerData.user_number))

                    setStatus('welcome')
                    setMessage('회원가입이 완료되었습니다!')

                    // 2초 후 메인으로 이동
                    setTimeout(() => router.push("/"), 2000)
                }
            } catch (error: any) {
                console.error("Social login error:", error)
                setStatus('error')
                setMessage(error.message || "오류가 발생했습니다.")
            }
        }

        if (email) {
            checkAndRegister()
        } else {
            setStatus('error')
            setMessage('이메일 정보가 없습니다.')
        }
    }, [email, name, provider, router])

    if (status === 'loading' || status === 'registering') {
        return (
            <main className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-purple-50 to-white">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">
                        {status === 'loading' ? '로그인 확인 중...' : '회원가입 진행 중...'}
                    </p>
                </div>
            </main>
        )
    }

    if (status === 'error') {
        return (
            <main className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-purple-50 to-white">
                <div className="flex flex-col items-center w-full max-w-[360px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">오류 발생</h1>
                    <p className="text-sm text-red-500 text-center mb-6">{message}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-purple-500 text-white font-bold py-3 rounded-lg hover:bg-purple-600 active:scale-[0.98] transition-all"
                    >
                        로그인 페이지로 돌아가기
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-purple-50 to-white">
            <div className="flex flex-col items-center w-full max-w-[360px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🎉</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">환영합니다!</h1>
                <p className="text-lg font-medium text-purple-600 mb-1">{name}님</p>
                {email && <p className="text-sm text-gray-500 mb-4">{email}</p>}
                {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
                <p className="text-sm text-gray-600 text-center">잠시 후 메인 페이지로 이동합니다...</p>
            </div>
        </main>
    )
}

export default function LoginCallbackPage() {
    return (
        <Suspense fallback={
            <main className="flex w-full h-screen justify-center items-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </main>
        }>
            <CallbackContent />
        </Suspense>
    )
}
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";