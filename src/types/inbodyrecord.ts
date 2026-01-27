export interface InbodyRecord {
    inbody_id: number;
    user_id: number;
    measurement_data: number;
    height: number;
    weight: number;
    body_fat_mass: number;
    body_fat_pct: number;
    skeleton_muscle_mass: number;
    bmr: number;
    bisceral_fat_level: number;
    abdominal_fat_ratio: number;
    created_at: string;
}