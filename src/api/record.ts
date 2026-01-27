import { getJson } from "./client";

export async function getRecord() {
    return getJson("/record");
}
