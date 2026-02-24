import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, InbodyRecord, UserGoal, TodayIntake, DietPlanResponse, Food, Restaurant } from '@/types/definitions'

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
    restaurantData: Restaurant | null;  // 식당 추천 데이터 (persist)
    setDietPlan: (plan: any) => void;
    setTodayIntake: (intake: TodayIntake) => void;
    setTodayRecord: (record: any) => void;
    setRestaurantData: (data: Restaurant | null) => void;
    toggleMealCheck: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', food: any) => void;
    updateCheckedMeal: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner', menuId: number, updates: any) => void;
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
            restaurantData: null,
            setDietPlan: (dietPlan) => set({ dietPlan, lastFetched: Date.now() }),
            setTodayIntake: (todayIntake) => set({ todayIntake }),
            setTodayRecord: (todayRecord) => set({ todayRecord }),
            setRestaurantData: (restaurantData) => set({ restaurantData }),
            toggleMealCheck: (date, mealType, food) => {
                const current = get().checkedMeals;
                const dayMeals = current[date] || { breakfast: [], lunch: [], dinner: [] };
                const mealList = dayMeals[mealType] || [];

                // 아이템 비교 헬퍼 함수
                const isSameFood = (item1: any, item2: any) => {
                    const menuId1 = item1.menuId || item1.menu_id;
                    const menuId2 = item2.menuId || item2.menu_id;

                    // 1. menuId가 둘 다 있으면 menuId가 같아야만 일치
                    if (menuId1 && menuId2) {
                        return String(menuId1) === String(menuId2);
                    }

                    // 2. 이름 비교
                    const name1 = item1.food_name || item1.name;
                    const name2 = item2.food_name || item2.name;

                    if (name1 && name2 && name1 === name2) {
                        // 이름이 같을 때, 식당 이름이 둘 다 있으면 식당 이름도 같아야 함
                        const rest1 = item1.restaurant_name;
                        const rest2 = item2.restaurant_name;
                        if (rest1 && rest2) {
                            return rest1 === rest2;
                        }
                        return true; // 식당 정보가 하나라도 없으면 이름만으로 판단
                    }
                    return false;
                };

                // 이미 체크되어 있는지 확인
                const isChecked = mealList.some((f: any) => isSameFood(f, food));

                const newMealList = isChecked
                    ? mealList.filter((f: any) => !isSameFood(f, food)) // 제거
                    : [...mealList, food]; // 추가

                set({
                    checkedMeals: {
                        ...current,
                        [date]: {
                            ...dayMeals,
                            [mealType]: newMealList
                        }
                    }
                });
            },
            updateCheckedMeal: (date, mealType, menuId, updates) => {
                const current = get().checkedMeals;
                const dayMeals = current[date];
                if (!dayMeals) return;

                const mealList = dayMeals[mealType] || [];
                // menuId 타입 불일치 방지 (문자열/숫자)
                const targetIndex = mealList.findIndex((item: any) => String(item.menuId) === String(menuId));

                if (targetIndex === -1) return;

                const newMealList = [...mealList];
                newMealList[targetIndex] = { ...newMealList[targetIndex], ...updates };

                set({
                    checkedMeals: {
                        ...current,
                        [date]: {
                            ...dayMeals,
                            [mealType]: newMealList
                        }
                    }
                });
            },
            clearCheckedMeals: (date) => {
                const current = get().checkedMeals;
                const { [date]: _, ...rest } = current;
                set({ checkedMeals: rest });
            },
            setCurrentMealSlide: (index) => set({ currentMealSlide: index }),
            resetDiet: () => set({ dietPlan: null, todayIntake: null, todayRecord: null, lastFetched: null, checkedMeals: {}, currentMealSlide: 0, restaurantData: null }),
        }),
        {
            name: 'diet-storage',
            partialize: (state) => ({
                dietPlan: state.dietPlan,
                todayIntake: state.todayIntake, // 오늘의 섭취 정보도 저장
                lastFetched: state.lastFetched,
                checkedMeals: state.checkedMeals,  // 체크 상태도 저장
                restaurantData: state.restaurantData,  // 식당 데이터도 저장
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
