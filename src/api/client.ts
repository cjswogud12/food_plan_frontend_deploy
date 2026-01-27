const BASE_URL = "http://localhost:8000/api";

export async function postFormData(endpoint: string, formData: FormData) {
    const response = await fetch (`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData
    });
    return response;
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