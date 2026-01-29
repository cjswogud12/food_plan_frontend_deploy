"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, register } from "@/api/index"

export default function LoginForm() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [form, setForm] = useState({ username: "", password: "", id: ""})
    const [error, setError] = useState("")

    const handleSubmit = async () => {
    try {
        if (isLogin) {
            const res = await login(form.id, form.password)
            localStorage.setItem("user_id", res.user_id)
            alert("로그인 성공!")  // 추가
            router.push("/home")  // "/" → "/home" (폴더 구조 변경 후)
        } else {
            await register(form.id, form.password, form.username)
            alert("회원가입 성공! 로그인해주세요.")
            setIsLogin(true)
        }
    } catch (e: any) {
        // 에러 메시지를 팝업으로 표시
        alert(e.message || "오류가 발생했습니다.")
        setError(e.message)
    }
}

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input placeholder="아이디" onChange={(e) => setForm({ ...form, id: e.target.value })} />
            <input placeholder="비밀번호" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {!isLogin && (
                <>
                <input placeholder="아이디" onChange={(e) => setForm({ ...form, id: e.target.value})}/>
                <input placeholder="비밀번호" type="password" onChange={(e) => setForm({ ...form, password: e.target.value})}/>
                <input placeholder="닉네임" onChange={(e) => setForm({ ...form, username: e.target.value})}/>
                </>
            )}
            <button onClick={handleSubmit}
            style={{ 
                padding: "10px 20px", 
                marginTop: "10px",
                backgroundColor: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
            }}>{isLogin ? "로그인" : "회원가입"}
            </button>
            <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer", color: "blue" }}>
                {isLogin ? "회원가입하기" : "로그인하기"}
            </p>
        </div>
    )
}