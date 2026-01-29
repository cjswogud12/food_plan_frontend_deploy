const BASE_URL = "http://localhost:8000/api";

// api 통신 경로 통합 관리

export async function postFormData(
    endpoint: string,
    formData: FormData,
    options?: { timeoutMs?: number }
) {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function postJson(endpoint: string, data: object) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

export async function getJson(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return response;
}

// --- Auth (Login/Register) ---

export async function login(id: string, password: string) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || "로그인 실패")
    return res.json()
}

export async function register(id: string, password: string, username: string) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            password,
            username
        }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || "회원가입 실패")
    return res.json()
}

// --- Inbody ---

export async function uploadInbodyImage(formData: FormData) {
    return postFormData("/inbody-ocr", formData, { timeoutMs: 15000 });
}

export async function getInbody() {
    return getJson("/inbody");
}

// --- Mypage ---

export async function getMypage() {
    return getJson("/mypage");
}

// --- Record ---

export async function getRecord(date?: string) {
    const query = date ? `?date=${date}` : "";
    return getJson(`/record${query}`);
}

// --- User ---

export async function getUser() {
    return getJson("/user");
}

export async function getUserGoal() {
    return getJson("/user/goal");
}

// --- 체형 분류 ---
// user_number를 보내면 stage1, stage2, metrics, reason 등을 반환
export async function getBodyClassification(userNumber: number) {
    return getJson(`/classify/bodytype/by-user=${userNumber}`);
}
// --- 인바디 기록 조회---
// user_number와 limit(개수)를 보내면 인바디 기록 배열을 반환
export async function getInbodyHistory(userNumber: number, limit: number = 10) {
    return getJson(`/inbody-history=${userNumber}&limit=${limit}`);
}