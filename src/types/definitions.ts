// 요소 통합 정리

export interface User {
    user_number: number;
    id: string; //로그인 아이디
    username: string; //사용자 이름(표시용)
    password: string;
    created_at: string; //생성일
    email: string;
    provider_user_id: string; //소셜 로그인 용 아이디
    role: string; //권한
}

export interface UserProfile {
    profile_id: number;
    height: number;
    weight: number;
    age: number;
    birth_date: string;
    gender: string;
    goal_type: string; // 목표 타입 : 다이어트/ 유지/ 벌크업
    body_fat_percent: number;
    skeleton_muscle_mass: number;
    bmr: number;
    created_at: string;
    updated_at: string;
}

export interface UserGoal {
    goal_id: number;
    id: string;
    user_number: number;
    goal_type: string;
    target_calory: number;
    target_protein: number;
    target_carb: number;
    target_fat: number;
    target_macros: string; //c,p,f(탄단지) 또는 비율 문자열
    target_pace: string; // 감량/증량 목표
    start_date: string;
    end_date: string;
    created_at: string;
}
// ==========================================
// 기록, 음식
// ==========================================
export interface Food {
    food_id: number;
    user_number: number;
    food_name: string;
    food_calories: number;
    food_proteins: number;
    food_carbs: number;
    food_fats: number;
    food_image?: string;
}

export interface Record {
    record_id: number;
    user_number: number;
    food_id: number;
    food_name: string;
    food_calories: number;
    food_protein: number;
    food_carbs: number;
    food_fats: number;
    serving_size: number;
    serving_unit: string;
    quantity: number;

    //추가정보
    goal_calories: number;
    image_url?: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    record_created_at: string;
}

// ==========================================
// 인바디 기록, bmi 기록
// ==========================================
export interface InbodyRecord {
    inbody_id: number;
    user_number: number;

    //인바디 측정값
    measurement_date: string; //측정일
    height: number; //키
    weight: number;//몸무게
    body_fat_mass: number;//체지방량
    body_fat_pct: number; //체지방률
    skeleton_muscle_mass: number; //골격근량
    bmr: number; //기초대사량
    bisceral_fat_level: number; //비만지수
    inbody_score: number; //인바디 점수
    abdominal_fat_ratio: number; //복부지방률
    predicted_classification: number; //체형분류(선택)
    classification_name: string; //체형분류명(선택)
    created_at: string;
}

export interface BMIHistory {
    bmi_history_id: number;
    user_number: number;
    bmi: number;
    bmi_history_created_at: string;
}

// 체형 분석 응답
interface BodyClassificationResponse {
    stage1: string;           // "마름", "비만" 등
    stage2: string;           // "초저체중(위험)", "근감소성비만" 등
    metrics: {
        bmi: number;
        body_fat_pct: number;
        body_fat_kg: number;
        skeletal_muscle_kg: number;
        ffm_kg: number;
        ffmi: number;
        smm_ratio: number;
        bmr_per_kg: number;
    };
    reason: string;           // 분류 이유 설명
}
// 인바디 기록 응답 (배열)
interface InbodyHistoryItem {
    inbody_id: number;
    measurement_date: string | null;
    height: number;
    weight: number;
    body_fat_pct: number;
    skeletal_muscle_mass: number;
    predicted_cluster: string | null;
    cluster_name: string | null;
    values: {
        height: number;
        weight: number;
        body_fat_mass: number;
        body_fat_pct: number;
        skeletal_muscle_mass: number;
        bmr: number;
        inbody_score: number;
    };
    created_at: string;
}