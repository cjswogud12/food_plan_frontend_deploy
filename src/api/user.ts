import { getJson } from "./client";

export async function getUser() {
    return getJson("/user");
}

export async function getUserGoal() {
    return getJson("/user/goal");
}

