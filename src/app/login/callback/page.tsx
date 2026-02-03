"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase" // Adjust path if needed

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

function CallbackContent() {
    const params = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'welcome' | 'registering' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const processedRef = useRef(false) // Prevent double execution in React Strict Mode

    const code = params.get("code")
    // Fallback for direct params (legacy)
    const nameParam = params.get("name")
    const emailParam = params.get("email")
    const providerParam = params.get("provider")

    useEffect(() => {
        if (processedRef.current) return
        processedRef.current = true

        const handleAuth = async () => {
            try {
                let accessToken = ""
                let userEmail = emailParam || ""
                let userName = nameParam || ""
                let userProvider = providerParam || "google"

                if (code) {
                    // 1. Supabase Code Exchange (PKCE)
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    if (!data.session) throw new Error("No session created")

                    accessToken = data.session.access_token
                    userEmail = data.user.email || ""
                    userName = data.user.user_metadata?.name || data.user.user_metadata?.full_name || "사용자"
                    // Provider inference might be tricky from session alone depending on metadata, 
                    // but usually frontend knows what it initiated, or we check app_metadata
                    userProvider = data.user.app_metadata?.provider || "google"
                } else {
                    // 2. Fallback: Check if session already exists (Implicit flow or already processed)
                    const { data: { session }, error } = await supabase.auth.getSession()

                    if (session) {
                        console.log("Existing session found")
                        accessToken = session.access_token
                        userEmail = session.user.email || ""
                        userName = session.user.user_metadata?.name || session.user.user_metadata?.full_name || "사용자"
                        userProvider = session.user.app_metadata?.provider || "google"
                    } else if (emailParam) {
                        // Legacy support
                        userEmail = emailParam
                    } else {
                        // Really no info
                        throw new Error("인증 정보가 부족합니다. (Code or Email missing)")
                    }
                }

                // 2. Social Check API Call
                // 2. Social Check API Call
                // Backend requires POST request (based on 405 error)
                const headers: HeadersInit = {
                    "Content-Type": "application/json"
                }
                if (accessToken) {
                    headers["Authorization"] = `Bearer ${accessToken}`
                }

                // Send data in Body instead of Query Params
                const checkRes = await fetch(`${BASE_URL}/api/auth/social-check`, {
                    method: "POST",
                    headers,
                    credentials: "include",
                    body: JSON.stringify({
                        email: userEmail,
                        provider: userProvider,
                        access_token: accessToken
                    })
                })

                if (!checkRes.ok) {
                    const errorText = await checkRes.text()
                    throw new Error(`소셜 체크 실패 (${checkRes.status}): ${errorText}`)
                }

                const checkData = await checkRes.json()

                if (checkData.registered) {
                    // Registered
                    // Backend returns 'id' field, not 'user_id' based on logs
                    const userId = checkData.id || checkData.user_id
                    if (userId) {
                        localStorage.setItem("user_id", userId)
                        console.log("Logged in with user_id:", userId)
                    } else {
                        console.error("No id in checkData:", checkData)
                        throw new Error("서버 응답에 사용자 ID(id)가 없습니다.")
                    }

                    if (checkData.user_number) localStorage.setItem("user_number", String(checkData.user_number))

                    setStatus('welcome')
                    setMessage(`${userName}님 환영합니다!`)
                    setTimeout(() => router.push("/"), 1000)
                } else {
                    // Not Registered
                    setStatus('registering')

                    const registerRes = await fetch(`${BASE_URL}/api/auth/social-register`, {
                        method: "POST",
                        headers: {
                            ...headers,
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            email: userEmail,
                            name: userName,
                            username: userName,
                            provider: userProvider,
                            access_token: accessToken
                        })
                    })

                    if (!registerRes.ok) {
                        const errorText = await registerRes.text()
                        throw new Error(`소셜 회원가입 실패 (${registerRes.status}): ${errorText}`)
                    }

                    const registerData = await registerRes.json()

                    // Backend likely returns 'id' here too
                    const newUserId = registerData.id || registerData.user_id
                    if (newUserId) {
                        localStorage.setItem("user_id", newUserId)
                        console.log("Registered with user_id:", newUserId)
                    } else {
                        console.error("No id in registerData:", registerData)
                        throw new Error("회원가입 응답에 사용자 ID(id)가 없습니다.")
                    }

                    if (registerData.user_number) localStorage.setItem("user_number", String(registerData.user_number))

                    setStatus('welcome')
                    setMessage('회원가입이 완료되었습니다!')
                    setTimeout(() => router.push("/"), 2000)
                }

            } catch (error: any) {
                console.error("Auth Error:", error)
                setStatus('error')
                setMessage(error.message || "로그인 처리 중 오류 발생")
            }
        }

        handleAuth()
    }, [code, emailParam, nameParam, providerParam, router])

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
        <main className="flex flex-col w-full h-screen justify-center items-center bg-gradient-to-b from-indigo-50 to-white">
            <div className="flex flex-col items-center w-full max-w-[360px] mx-auto p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🎉</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">환영합니다!</h1>
                <p className="text-lg font-medium text-purple-600 mb-1">{message || "로그인 성공"}</p>
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