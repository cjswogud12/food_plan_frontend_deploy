// 요소 통합 정리

import { LargeNumberLike } from "crypto";

export interface User {
    user_number: number;
    id: string; //로그인 아이디
    username: string; //사용자 이름(표시용)
    password: string;
    created_at: string; //생성일
    email: string;
    provider_user_id: string; //소셜 로그인 용 아이디
    role: string; //권한
    gender?: string;
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
    skeletal_muscle_mass: number;
    bmr: number;
    created_at: string;
    updated_at: string;
}

export interface UserGoal {
    goal_id: number;
    goal_type: string;
    target_calorie: number;
    target_protein: number | null;
    target_carb: number | null;
    target_fat: number | null;
    target_macros: string | null;
    target_pace: string | null;
    start_date: string;
    end_date: string;
    created_at: string;
    plan: {
        goal_type: string;
        target_calorie: number;
        body_type_stage1: string;
        body_type_stage2: string;
        note: [string],
        days: [{
            day_label: string;
            date: string;
            breakfast: {
                name: string;
                description: string;
                calories_kcal: number;
                carbs_g: number;
                protein_g: number;
                fat_g: number;
                image_url: string;
            },
            lunch: {
                name: string;
                description: string;
                calories_kcal: number;
                carbs_g: number;
                protein_g: number;
                fat_g: number;
                image_url: string;
            },
            dinner: {
                name: string;
                description: string;
                calories_kcal: number;
                carbs_g: number;
                protein_g: number;
                fat_g: number;
                image_url: string;
            },
            total_calories_kcal: number;
            total_carbs_g: number;
            total_protein_g: number;
            total_fat_g: number;
        }]
    },
    today_intake: {
        goal_type: string;
        target_calorie: number;
        total_calories_kcal: number;
        total_carbs_g: number;
        total_protein_g: number;
        total_fat_g: number;
        plan_date: string;
        confidence: number;
    }
}

// ==========================================
// 주소 및 활동 수준
// ==========================================
export interface UserAddress {
    user_number: number;
    home_address: string | null;
    company_address: string | null;
}

export interface UserActivityLevel {
    user_number: number;
    activity_level: string;
    factor?: number; // 응답 값에 포함될 수 있음
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
    skeletal_muscle_mass: number; //골격근량
    bmr: number; //기초대사량
    bmi?: number; // BMI (Additional)
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

export interface FoodAnalysisResult {
    far_id: number;
    user_id: number;
    image_url: string;
    predicted_food_name: string;
    predicted_reason: string;
    estimated_serving_g: number;
    estimated_calories_kcal: number;  //GPT가 추정한 해당 음식의 칼로리(kcal)
    estimated_carbs_g: number;  //GPT가 추정한 탄수화물 함량(g
    estimated_protein_g: number;  //GPT가 추정한 단백질 함량(g)
    estimated_fat_g: number;  //GPT가 추정한 지방 함량(g)
    model: string; //음식 분석에 사용된 AI 모델명 (예: gpt-4.1-mini)
    status: number; //분석 결과 상태 (PENDING: 기록 확정 전, CONFIRMED: 식단 기록으로 확정됨)
    created_at: string; //음식 분석 결과 생성일
}

export interface DietPlanItem {
    food_name: string;
    food_calories: number;
    image_url?: string;
    // 필요한 경우 다른 필드 추가 (예: carbohydrates, protein, fat 등)
}

export interface DietPlanKakaoMap {
    food_name: string;
    place: {
        id: string,
        name: string,
        category_group_code: string,
        category_group_name: string,
        category_name: string,
        address_name: string,
        road_address_name: string,
        phone: string,
        place_url: string,
        distance_m: number,
        x: number,
        y: number,
    }[]
    lat: number; //위도
    lng: number; //경도
    radius_m: number; //범위
}

export interface TodayIntake {
    goal_type: string;
    target_calorie: number;
    total_calories_kcal: number;
    total_carbs_g: number;
    total_protein_g: number;
    total_fat_g: number;
    plan_date: string;
}

export interface DietPlanResponse {
    days: any[]; // 구체적인 타입 정의 필요시 추가
    today_intake: TodayIntake;
}

export interface Restaurant {
    goal_type: string;
    tdee_kcal: number;
    daily_target_kcal: number;
    meal_target_kcal: {
        breakfast: number;
        lunch: number;
        dinner: number;
    };
    used_radius_m: number;
    collector_triggered: boolean;

    breakfast: RestaurantMenuItem[];
    lunch: RestaurantMenuItem[];
    dinner: RestaurantMenuItem[];
}

export interface RestaurantMenuItem {
    restaurant_id: number;
    restaurant_name: string;
    menu_id: number;
    menu_name: string;
    price: number;
    distance_m: number;
    calories_kcal: number;
    carbs_g: number;
    protein_g: number;
    fat_g: number;
    confidence: number;
    place_url?: string;
}

// ==========================================
// 식단 체크 기록 저장
// ==========================================
export interface MenuCheckItem {
    meal_type: "breakfast" | "lunch" | "dinner";
    menu_id: number;
    checked: boolean;
}

export interface MenuCheckRequest {
    label: string;                    // "home" | "company"
    radius_m: number;
    record_date: string;              // "YYYY-MM-DD"
    meals: MenuCheckItem[];
}

export interface MenuCheckResponse {
    record_ids: number[];
}
