const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

// api 통신 경로 통합 관리

import { supabase } from "@/lib/supabase"

async function getAuthHeader(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.access_token) {
        console.warn("No active Supabase session found.")
        return {}
    }
    return { "Authorization": `Bearer ${data.session.access_token}` }
}

export async function postFormData(
    endpoint: string,
    formData: FormData,
    options?: { timeoutMs?: number }
) {
    const controller = new AbortController();
    const timeoutMs = options?.timeoutMs ?? 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const authHeader = await getAuthHeader();
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                ...authHeader
            },
            body: formData,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function postJson(endpoint: string, data: object) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...authHeader
        },
        body: JSON.stringify(data)
    });
    return response;
}

export async function getJson(endpoint: string) {
    const authHeader = await getAuthHeader();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            ...authHeader
        }
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
    // Supabase logout
    await supabase.auth.signOut()
    return { message: "Logged out" }
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
    // Clean JWT implementation
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
    if (userNumber) query += `&user_number=${userNumber}`;

    const authHeader = await getAuthHeader();

    const response = await fetch(`${BASE_URL}/record${query}`, {
        method: "DELETE",
        headers: {
            ...authHeader,
        },
        // credentials: "include", // 쿠키 기반이 아니면 필요 없음 (원하면 유지해도 됨)
    });

    if (!response.ok) {
        const t = await response.text();
        throw new Error(`Failed to delete records (${response.status}): ${t}`);
    }

    // 백엔드가 204 No Content 반환하면 json() 하면 에러남
    if (response.status === 204) return null;
    return response.json();
}

export async function deleteRecord(recordId: number) {
    const authHeader = await getAuthHeader();

    const response = await fetch(`${BASE_URL}/record/${recordId}`, {
        method: "DELETE",
        headers: {
            ...authHeader,
        },
        // credentials: "include",
    });

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

export async function updateUserGoal(userNumber: number, goalType: string, targetCalorie: number) {
    return postJson("/user/goal", { user_number: userNumber, goal_type: goalType, target_calorie: targetCalorie });
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

//-----식단 계획---------
export async function getDietplan(user_number: number, id: string, goal_type: string, target_calorie: number) {
    const response = await postJson("/diet-plan", {
        user_number,
        id,
        goal_type,
        target_calorie
    });

    if (!response.ok) throw new Error("식단 생성 실패");
    return response.json();
}

// --- 오늘의 섭취 ---
export async function getTodayIntake() {
    return getJson("/intake/today");
}


// --- 지도: 주변 식당 검색 ---
export async function getNearbyPlaces(foodName: string, lat: number, lng: number, radius: number = 2000) {
    const payload = {
        food_name: foodName,
        lat,
        lng,
        radius_m: radius
    };
    console.log("SENDING /diet-plan/places:", payload);

    const response = await postJson("/diet-plan/places", payload);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`장소 검색 실패: ${response.status} ${errorText}`);
    }
    return response.json();
}

export async function getCalendarRecord(userNumber: number, year: number, month: number) {
    return getJson(`/calendar?user_number=${userNumber}&year=${year}&month=${month}`);
}

// 인바디 삭제
export async function deleteInbody() {
    const authHeader = await getAuthHeader();
    return fetch(`${BASE_URL}/inbody-latest`, {
        method: "DELETE",
        headers: { ...authHeader }
    });
}

// --- 메뉴 선택 (식단 교체) ---
export async function selectMenuItem(menu_item_id: number, meal_type: string, reason_text: string = "사용자 선택") {
    return postJson("/node/select", {
        menu_item_id,
        meal_type,
        reason_text,
    });
}

// --- 주변 식당 검색 (entrypoint Agent Node A) ---
export async function fetchNearbyRestaurants(address_text: string, lat: number, lng: number, radius_m: number) {
    return postJson("/node/run", {
        address_text,
        lat,
        lng,
        radius_m
    });
}

// --- 주소 설정 (Address) ---
export interface UserAddressData {
    user_number: number;
    home_address: string | null;
    company_address: string | null;
}

export async function getUserAddress(userNumber: number) {
    return getJson(`/user/address?user_number=${userNumber}`);
}

export async function updateUserAddress(data: UserAddressData) {
    return postJson("/user/address", data);
}

// --- 활동 수준 (Activity Level) ---
export async function updateUserActivity(userNumber: number, activityLevel: string) {
    // Request: { "user_number": 0, "activity_level": "string" }
    // Response: { "user_number": int, "activity_level": "string", "factor": float }
    return postJson("/user/activity-level", {
        user_number: userNumber,
        activity_level: activityLevel
    });
}
