const BASE_URL = "http://localhost:8000"

export async function login(username: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || "로그인 실패")
    return res.json()
}

export async function signup(form: any) {
    const res = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...form,
            height: parseFloat(form.height),
            weight: parseFloat(form.weight),
            age: parseInt(form.age),
        }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || "회원가입 실패")
    return res.json()
}