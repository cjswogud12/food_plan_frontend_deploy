export interface User {
    user_id: number;
    username: string;
    password: string;
    created_at: string;
    email: string;
    height: number;
    weight: number;
    age: number;
    gender: string;
    goal: string;  // '다이어트' | '벌크업' | '유지'
    goal_calories: number;
    goal_protein: number;
    goal_carbs: number;
    goal_fats: number;
    current_calories: number;
    current_protein: number;
    current_carbs: number;
    current_fats: number;
}