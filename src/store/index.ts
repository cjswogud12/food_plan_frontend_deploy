import { create } from 'zustand'
import { User, InbodyRecord } from '@/types/definitions'

// 사용자 관련 전역 상태
interface UserState {
    user: User | null;
    userGoal: any | null;
    setUser: (user: User | null) => void;
    setUserGoal: (goal: any) => void;
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
import { persist } from 'zustand/middleware'

// 체크된 음식 타입: { "2026-02-03": { breakfast: [...], lunch: [...], dinner: [] } }
interface CheckedMeals {
    [date: string]: {
        breakfast: any[];
        lunch: any[];
        dinner: any[];
    };
}

interface DietState {
    dietPlan: any | null;
    todayIntake: any | null;
    todayRecord: any | null;
    lastFetched: number | null;
    checkedMeals: CheckedMeals;  // 체크된 음식들
    setDietPlan: (plan: any) => void;
    setTodayIntake: (intake: any) => void;
    setTodayRecord: (record: any) => void;
    toggleMealCheck: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', food: any) => void;
    clearCheckedMeals: (date: string) => void;
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

                set({
                    checkedMeals: {
                        ...current,
                        [date]: {
                            ...dayMeals,
                            [mealType]: newMealList
                        }
                    },
                    // Update TodayIntake Optimistically
                    todayIntake: get().todayIntake ? {
                        ...get().todayIntake,
                        total_calories_kcal: (get().todayIntake.total_calories_kcal || 0) + (isChecked ? -1 : 1) * (food.calories || food.food_calories || 0),
                        total_carbs_g: (get().todayIntake.total_carbs_g || 0) + (isChecked ? -1 : 1) * (food.carbs || food.food_carbs || 0),
                        total_protein_g: (get().todayIntake.total_protein_g || 0) + (isChecked ? -1 : 1) * (food.protein || food.food_proteins || 0),
                        total_fat_g: (get().todayIntake.total_fat_g || 0) + (isChecked ? -1 : 1) * (food.fat || food.food_fats || 0),
                    } : null
                });
            },
            clearCheckedMeals: (date) => {
                const current = get().checkedMeals;
                const { [date]: _, ...rest } = current;
                set({ checkedMeals: rest });
            },
            resetDiet: () => set({ dietPlan: null, todayIntake: null, todayRecord: null, lastFetched: null, checkedMeals: {} }),
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
