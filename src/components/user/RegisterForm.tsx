"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { register } from "@/api/index"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterForm() {
    const router = useRouter()
    const [form, setForm] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        name: "",
        age: "",
        gender: "남자"
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        if (!form.username || !form.password || !form.passwordConfirm || !form.name || !form.age) {
            alert("모든 필드를 입력해주세요.")
            return
        }

        if (form.password !== form.passwordConfirm) {
            alert("비밀번호가 일치하지 않습니다.")
            return
        }

        setIsLoading(true)
        // setError("") // Removed

        try {
            await register(form.username, form.password, form.name, Number(form.age), form.gender)
            alert("회원가입 성공! 로그인해주세요.")
            router.push('/login')
        } catch (e: any) {
            console.error(e)
            alert(e.message || "회원가입에 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="flex flex-col items-center w-full max-w-[360px] mx-auto py-8">
            {/* Title */}
            <div className="mb-6 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-black tracking-tight">회원가입</h1>
            </div>

            {/* Error Message */}


            {/* Form Fields */}
            <div className="w-full space-y-3">
                {/* Username with duplicate check */}
                <div>
                    <label className="block text-sm text-slate-600 mb-1">아이디</label>
                    <div className="flex gap-2">
                        <input
                            placeholder="아이디를 입력하세요"
                            className="flex-1 px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                        <button
                            className="w-full mt-6 bg-gradient-to-r from-purple-200 to-purple-200 text-black font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            중복 확인
                        </button>
                    </div>
                </div>

                {/* Password */}
                {/* Password */}
                <div>
                    <label className="block text-sm text-slate-600 mb-1">비밀번호</label>
                    <div className="relative w-full">
                        <input
                            placeholder="비밀번호를 입력하세요"
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 pr-12 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                {/* Password Confirm */}
                {/* Password Confirm */}
                <div>
                    <label className="block text-sm text-slate-600 mb-1">비밀번호 확인</label>
                    <div className="relative w-full">
                        <input
                            placeholder="비밀번호를 한번 더 입력하세요"
                            type={showPasswordConfirm ? "text" : "password"}
                            className="w-full px-4 py-3 pr-12 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 mt-3 text-slate-400 hover:text-slate-600"
                        >
                            {showPasswordConfirm ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm text-slate-600 mb-1">이름</label>
                    <input
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                {/* Age */}
                <div>
                    <label className="block text-sm text-slate-600 mb-1">나이</label>
                    <input
                        placeholder="나이를 입력하세요"
                        type="number"
                        className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                </div>

                {/* Gender Toggle */}
                <div className="mb-2">
                    <label className="block text-sm text-slate-600 mb-1">성별</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, gender: "남자" })}
                            className={`flex-1 py-3 rounded-lg font-bold ${form.gender === "남자"
                                ? "bg-gradient-to-r from-purple-200 to-purple-200 text-black"
                                : "bg-purple-100 text-slate-600 hover:bg-purple-100"
                                }`}
                        >
                            남자
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, gender: "여자" })}
                            className={`flex-1 py-3 rounded-lg font-bold ${form.gender === "여자"
                                ? "bg-gradient-to-r from-purple-200 to-purple-200 text-black"
                                : "bg-purple-100 text-slate-600 hover:bg-purple-100"
                                }`}
                        >
                            여자
                        </button>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-3 bg-purple-400 text-white font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all"
            >
                회원가입하기
            </button>

            {/* Back Button */}
            <button
                onClick={() => router.push('/login')}
                className="w-full mt-3 bg-gradient-to-r from-purple-200 to-purple-200 text-black font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                홈으로
            </button>
        </div>
    )
}