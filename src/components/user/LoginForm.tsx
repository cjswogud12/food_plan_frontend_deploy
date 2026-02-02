"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/api/index"
import { Eye, EyeOff } from "lucide-react"

export default function LoginForm() {
    const router = useRouter()
    const [form, setForm] = useState({ username: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (!form.username || !form.password) {
            alert("아이디와 비밀번호를 모두 입력해주세요.")
            return
        }

        setIsLoading(true)

        try {
            const res = await login(form.username, form.password)
            if (res && (res.id || res.token)) {
                localStorage.setItem("user_id", res.id || "dummy_id")
                if (res.user_number) localStorage.setItem("user_number", res.user_number);
                router.push("/")
            } else {
                throw new Error("로그인 실패")
            }
        } catch (e: any) {
            console.error(e)
            alert(e.message || "아이디 또는 비밀번호를 확인해주세요.")
        } finally {
            setIsLoading(false)
        }
    }

    // 구글 소셜 로그인 - 백엔드 OAuth 엔드포인트로 리다이렉트
    const handleGoogleLogin = () => {
        // 백엔드에서 구글 OAuth URL 설정 필요
        window.location.href = "http://localhost:8000/api/auth/google";
    }
    return (
        <main className="flex flex-col w-full h-full justify-center">
            <div className="flex flex-col items-center w-full max-w-[360px] mx-auto py-8">
                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-50 h-50 bg-purple-100 rounded-full flex items-center justify-center mb-4 border-4 border-dotted border-purple-400">
                        <span className="text-black font-bold text-3xl">로고 부분</span>
                    </div>
                </div>
                <div className="mb-4 flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-black tracking-tight">로그인</h1>
                </div>



                {/* Form Fields */}
                <div className="w-full space-y-3">
                    <input
                        placeholder="아이디"
                        className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />

                    <div className="relative">
                        <input
                            placeholder="비밀번호"
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400 pr-12"
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 mt-3 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                    </div>
                </div>

                {/* Login Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full mt-3 bg-purple-400 text-white font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all"
                >
                    {"로그인"}
                </button>
                {/* Helper Links */}
                <div className="w-full flex justify-between items-center mt-1 px-2 text-sm text-black font-medium">
                    <button onClick={() => router.push('/find-id')} className="hover:text-purple-600 transition-colors">아이디/비밀번호 찾기</button>
                    <button onClick={() => router.push('/register')} className="hover:text-purple-600 transition-colors">회원가입</button>
                </div>

                {/* Social Login Text */}
                <div className="w-full flex flex-col items-center gap-3 mt-3 mb-3">
                    <span className="text-sm font-medium text-gray-500">소셜 로그인</span>
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-4 justify-center">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                        title="구글 로그인"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>
                </div>
            </div>
        </main>
    )
}