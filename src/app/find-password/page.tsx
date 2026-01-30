"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FindPasswordPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [age, setAge] = useState("")

    const handleFindPassword = () => {
        if (!username || !name || !age) {
            alert("모든 정보를 입력해주세요.")
            return
        }
        // Mock functionality
        alert("일치하는 회원 정보가 없습니다.")
    }

    return (
        <main className="h-full w-full flex items-center justify-center bg-white p-6">
            <div className="flex flex-col items-center w-full max-w-[360px] mx-auto py-8">
                <div className="mb-8 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-black tracking-tight">비밀번호 찾기</h1>
                </div>

                <div className="w-full space-y-3">
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">아이디</label>
                        <input
                            placeholder="아이디를 입력하세요"
                            className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">이름</label>
                        <input
                            placeholder="이름을 입력하세요"
                            className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">나이</label>
                        <input
                            placeholder="나이를 입력하세요"
                            type="number"
                            className="w-full px-4 py-3 bg-purple-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all text-slate-700 placeholder:text-slate-400"
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleFindPassword}
                    className="w-full mt-3 bg-purple-400 text-white font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all"
                >
                    비밀번호 찾기
                </button>
                <button
                    onClick={() => router.push('/find-id')}
                    className="w-full mt-3 bg-purple-100 text-black font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all"
                >
                    아이디 찾기 페이지로 이동
                </button>
                <button
                    onClick={() => router.push('/login')}
                    className="w-full mt-3 bg-purple-100 text-black font-bold py-3 rounded-lg hover:bg-purple-500 active:scale-[0.98] transition-all"
                >
                    로그인 페이지로 이동
                </button>
            </div>
        </main>
    )
}
