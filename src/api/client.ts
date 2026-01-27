const BASE_URL = "http://localhost:8000/api";

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
        headers: { "content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

export async function getJson(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return response;
}
