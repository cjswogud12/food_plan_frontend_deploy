import { getJson } from "./client";

export async function getUser() {
    return getJson("/user");
}