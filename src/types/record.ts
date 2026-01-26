export interface Record {
    record_id: number;
    user_id: number;
    food_id: number;
    food_name: string;
    food_calories: number;
    food_protein: number;
    food_carbs: number;
    food_fats: number;
    goal_calories: number;
    image_url?: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    record_created_at: string;
}