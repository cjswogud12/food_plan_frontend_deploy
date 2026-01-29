import { getJson } from "./client";

export async function getRecord(date?: string) {
    const query = date ? `?date=${date}` : "";
    return getJson(`/record${query}`);
}
