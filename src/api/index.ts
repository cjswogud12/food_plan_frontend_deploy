const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

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
            signal: controller.signal,
            credentials: "include"
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
        body: JSON.stringify(data),
        credentials: "include"
    });
    return response;
}

export async function getJson(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include"
    });
    return response;
}

// --- Auth (Login/Register) ---

export async function login(id: string, password: string) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
        credentials: "include"
    })
    if (!res.ok) throw new Error((await res.json()).detail || "로그인 실패")
    return res.json()
}

export async function logout() {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    })
    if (!res.ok) throw new Error((await res.json()).detail || "로그아웃 실패")
    return res.json()
}

export async function register(id: string, password: string, username: string, age: number, gender: string) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            password,
            username,
            age,
            gender
        }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || "회원가입 실패")
    return res.json()
}

// --- Inbody ---

export async function uploadInbodyImage(
    formData: FormData,
    options?: { timeoutMs?: number }
) {
    // 예: 백엔드가 /inbody/upload 라면 그에 맞춰 수정
    return postFormData("/inbody-ocr", formData, options);
}

export async function getInbody(id?: string | null) {
    const query = id ? `?id=${id}` : "";
    return getJson(`/inbody${query}`);
}

// --- Mypage ---

export async function getMypage(id?: string | null) {
    const query = id ? `?id=${id}` : "";
    return getJson(`/mypage${query}`);
}

// --- Record 음식 삭제 ---

export async function getRecord(date?: string, userNumber?: number) {
    let query = date ? `?date=${date}` : "";
    if (userNumber) {
        query += query ? `&user_number=${userNumber}` : `?user_number=${userNumber}`;
    }
    return getJson(`/record${query}`);
}

export async function deleteDayRecords(date: string, userNumber?: number) {
    let query = `?date=${date}`;
    if (userNumber) {
        query += `&user_number=${userNumber}`;
    }
    const response = await fetch(`${BASE_URL}/record${query}`, {
        method: "DELETE",
        credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to delete records");
    return response.json();
}

export async function deleteRecord(recordId: number) {
    const response = await fetch(`${BASE_URL}/record/${recordId}`, {
        method: "DELETE",
        credentials: "include"
    });
    // if (!response.ok) throw new Error("Failed to delete record"); // 백엔드 응답이 204일수도 있고 200일수도 있음
    return response;
}

// --- User ---

export async function getUser(id?: string | null) {
    const query = id ? `?id=${id}` : "";
    return getJson(`/user${query}`);
}

export async function getUserGoal() {
    return getJson("/user/goal");
}

export async function updateUserGoal(goalType: string) {
    return postJson("/user/goal", { goal_type: goalType });
}

// --- 체형 분류 ---
// user_number를 보내면 stage1, stage2, metrics, reason 등을 반환
// --- 체형 분류 ---
export async function getBodyClassification(userNumber: number, bodyData?: any) {
    const payload = {
        user_number: userNumber,
        ...(bodyData || {})
    };
    return postJson(`/classify/bodytype?user_number=${userNumber}`, payload);
}
// --- 인바디 기록 조회---
// user_number와 limit(개수)를 보내면 인바디 기록 배열을 반환
export async function getInbodyHistory(userNumber: number, limit: number = 10) {
    return getJson(`/inbody-history=${userNumber}&limit=${limit}`);
}

// --- 음식 이미지 업로드 ---
export async function uploadFoodImage(formData: FormData) {
    return postFormData("/vision/food", formData, { timeoutMs: 15000 });
}

// --- Chatbot ---
export async function chat(message: string, context: any) {
    return postJson("/chat", { message, context });
}