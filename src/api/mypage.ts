import { getJson } from "./client";

export async function getMypage() {
    return getJson("/mypage");
}