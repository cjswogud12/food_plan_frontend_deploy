import { postFormData, getJson } from "./client";

export async function uploadInbodyImage(formData: FormData) {
    return postFormData("/inbody-ocr", formData, { timeoutMs: 15000 });
}

export async function getInbody() {
    return getJson("/inbody");
}
