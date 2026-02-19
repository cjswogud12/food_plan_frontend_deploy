import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, InbodyRecord, UserGoal, TodayIntake, DietPlanResponse, Food } from '@/types/definitions'

// 사용자 관련 전역 상태
interface UserState {
    user: User | null;
    userGoal: UserGoal | null;
    setUser: (user: User | null) => void;
    setUserGoal: (goal: UserGoal | null) => void;
    resetUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            userGoal: null,
            setUser: (user) => set({ user }),
            setUserGoal: (userGoal) => set({ userGoal }),
            resetUser: () => set({ user: null, userGoal: null }),
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ user: state.user, userGoal: state.userGoal }),
        }
    )
)

// 식단 관련 전역 상태 (localStorage에 저장)

// 체크된 음식 타입: { "2026-02-03": { breakfast: [...], lunch: [...], dinner: [] } }
// 음식 데이터는 Food, DietPlanItem, 백엔드 응답 등 다양한 형태로 올 수 있음
interface CheckedMeals {
    [date: string]: {
        breakfast: any[];
        lunch: any[];
        dinner: any[];
    };
}

interface DietState {
    dietPlan: any | null; // DietPlanResponse.days[0] 객체를 저장 (전체 Response가 아님)
    todayIntake: TodayIntake | null;
    todayRecord: any | null;
    lastFetched: number | null;
    checkedMeals: CheckedMeals;  // 체크된 음식들
    currentMealSlide: number;  // 현재 식단 카드 슬라이드 인덱스
    setDietPlan: (plan: any) => void;
    setTodayIntake: (intake: TodayIntake) => void;
    setTodayRecord: (record: any) => void;
    toggleMealCheck: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', food: any) => void;
    clearCheckedMeals: (date: string) => void;
    setCurrentMealSlide: (index: number) => void;
    resetDiet: () => void;
}

export const useDietStore = create<DietState>()(
    persist(
        (set, get) => ({
            dietPlan: null,
            todayIntake: null,
            todayRecord: null,
            lastFetched: null,
            checkedMeals: {},
            currentMealSlide: 0,
            setDietPlan: (dietPlan) => set({ dietPlan, lastFetched: Date.now() }),
            setTodayIntake: (todayIntake) => set({ todayIntake }),
            setTodayRecord: (todayRecord) => set({ todayRecord }),
            toggleMealCheck: (date, mealType, food) => {
                const current = get().checkedMeals;
                const dayMeals = current[date] || { breakfast: [], lunch: [], dinner: [] };
                const mealList = dayMeals[mealType] || [];

                // 이미 체크되어 있으면 제거, 아니면 추가
                const foodId = food.food_name || food.name;
                const isChecked = mealList.some((f: any) => (f.food_name || f.name) === foodId);

                const newMealList = isChecked
                    ? mealList.filter((f: any) => (f.food_name || f.name) !== foodId)
                    : [...mealList, food];

                // Update TodayIntake Optimistically
                const currentIntake = get().todayIntake || {
                    total_calories_kcal: 0,
                    total_carbs_g: 0,
                    total_protein_g: 0,
                    total_fat_g: 0,
                };

                const calories = food.calories_kcal || food.calories || food.food_calories || 0;
                const carbs = food.carbs_g || food.carbs || food.food_carbs || 0;
                const protein = food.protein_g || food.protein || food.food_proteins || 0;
                const fat = food.fat_g || food.fat || food.food_fats || 0;

                const factor = isChecked ? -1 : 1; // Uncheck: decrease, Check: increase (이미 isChecked는 토글 전 상태가 아니라 현재 리스트에 있는지 여부)
                // 잠깐, 위 로직에서 isChecked는 "이미 리스트에 있었다면" 제거하는 것임.
                // 즉 isChecked가 true이면 제거(빼기), false이면 추가(더하기)가 맞음.

                set({
                    checkedMeals: {
                        ...current,
                        [date]: {
                            ...dayMeals,
                            [mealType]: newMealList
                        }
                    },
                    todayIntake: {
                        ...currentIntake,
                        total_calories_kcal: Math.max(0, currentIntake.total_calories_kcal + factor * calories),
                        total_carbs_g: Math.max(0, currentIntake.total_carbs_g + factor * carbs),
                        total_protein_g: Math.max(0, currentIntake.total_protein_g + factor * protein),
                        total_fat_g: Math.max(0, currentIntake.total_fat_g + factor * fat),
                    }
                });
            },
            clearCheckedMeals: (date) => {
                const current = get().checkedMeals;
                const { [date]: _, ...rest } = current;
                set({ checkedMeals: rest });
            },
            setCurrentMealSlide: (index) => set({ currentMealSlide: index }),
            resetDiet: () => set({ dietPlan: null, todayIntake: null, todayRecord: null, lastFetched: null, checkedMeals: {}, currentMealSlide: 0 }),
        }),
        {
            name: 'diet-storage',
            partialize: (state) => ({
                dietPlan: state.dietPlan,
                todayIntake: state.todayIntake, // 오늘의 섭취 정보도 저장
                lastFetched: state.lastFetched,
                checkedMeals: state.checkedMeals  // 체크 상태도 저장
            }),
        }
    )
)

// 인바디 관련 전역 상태
interface InbodyState {
    inbodyData: Partial<InbodyRecord> | null;
    inbodyRecords: Partial<InbodyRecord>[];
    setInbodyData: (data: Partial<InbodyRecord> | null) => void;
    setInbodyRecords: (records: Partial<InbodyRecord>[]) => void;
    resetInbody: () => void;
}

export const useInbodyStore = create<InbodyState>((set) => ({
    inbodyData: null,
    inbodyRecords: [],
    setInbodyData: (inbodyData) => set({ inbodyData }),
    setInbodyRecords: (inbodyRecords) => set({ inbodyRecords }),
    resetInbody: () => set({ inbodyData: null, inbodyRecords: [] }),
}))
