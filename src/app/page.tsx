"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { Plus, ChevronRight, Utensils, Check, Square } from "lucide-react"
import { getUser, getDietplan, getUserGoal, getTodayIntake } from "@/api/index"
import { useUserStore, useDietStore } from "@/store"

interface GoalsState {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export default function Mainpage() {
  const { isMobile } = useViewport();
  const router = useRouter();

  // Zustand Store 전역 상태관리
  const { user, setUser } = useUserStore();
  const { dietPlan, setDietPlan, todayIntake, setTodayIntake, lastFetched, checkedMeals, toggleMealCheck } = useDietStore();

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Local State 로컬 상태관리
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<GoalsState>({
    calories: 2000,
    carbs: 300,
    protein: 100,
    fat: 60,
  });

  // 로그인 체크 및 유저 정보/식단 가져오기
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. 유저 정보
        const userRes = await getUser(userId);
        const userData = userRes.ok ? await userRes.json() : null;
        if (userData) setUser(userData);

        // 2. 목표 정보
        const goalRes = await getUserGoal();
        const goalData = goalRes.ok ? await goalRes.json() : null;

        if (goalData) {
          setGoals({
            calories: goalData.target_calorie || 2000,
            carbs: goalData.target_carb || 300,
            protein: goalData.target_protein || 100,
            fat: goalData.target_fat || 60,
          });
        }

      } catch (err) {
        console.error("Failed to fetch main page data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, setUser]);

  // 식단 계획 및 오늘의 섭취 정보 가져오기 (User Store 의존)
  useEffect(() => {
    if (!user) return;

    const ONE_HOUR = 60 * 60 * 1000;

    // 식단 계획
    if (!(dietPlan && lastFetched && (Date.now() - lastFetched < ONE_HOUR))) {
      getUserGoal()
        .then(res => res.ok ? res.json() : null)
        .then(goalData => {
          if (!goalData) return;
          return getDietplan(
            user.user_number,
            user.id,
            goalData.goal_type,
            goalData.target_calorie
          );
        })
        .then(data => {
          if (data) setDietPlan(data.days?.[0]);
        })
        .catch(err => console.error(err));
    }

    // 오늘의 섭취 정보
    getTodayIntake()
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setTodayIntake(data);
      })
      .catch(err => console.error(err));

  }, [user, dietPlan, lastFetched, setDietPlan, setTodayIntake]);

  // 로딩 중이면 빈 화면
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">로딩 중...</div>;
  }

  // Handlers
  const handleAddMenu = (type: string) => {
    // 이 부분에 추후 엔드포인트, API 연결하여 이동 기능 추가 예정
  };

  // 비율 계산 (Goals 대비 Current) - 그래프용
  const getPercent = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const kcalPerCarb = 4;
  const kcalPerProtein = 4;
  const kcalPerFat = 9;

  // 전체 목표 칼로리 대비 섭취한 영양소의 칼로리 비중 (Graph Width)
  // todayIntake 데이터 사용
  const currentCal = todayIntake?.total_calories_kcal || 0;
  const currentCarbs = todayIntake?.total_carbs_g || 0;
  const currentProtein = todayIntake?.total_protein_g || 0;
  const currentFat = todayIntake?.total_fat_g || 0;

  const widthCarbs = Math.min(((currentCarbs * kcalPerCarb) / goals.calories) * 100, 100);
  const widthProtein = Math.min(((currentProtein * kcalPerProtein) / goals.calories) * 100, 100);
  const widthFat = Math.min(((currentFat * kcalPerFat) / goals.calories) * 100, 100);

  const PlanSection = ({ title, type, items }: { title: string, type: 'breakfast' | 'lunch' | 'dinner', items: any[] }) => {
    const todayChecked = checkedMeals[today]?.[type] || [];

    const isItemChecked = (item: any) => {
      const itemName = item.food_name || item.name;
      return todayChecked.some((f: any) => (f.food_name || f.name) === itemName);
    };

    const handleCheckClick = (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      toggleMealCheck(today, type, item);
    };

    return (
      <div className="bg-white border-2 border-indigo-50 p-4 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-700">{title}</h3>
          <button
            onClick={() => handleAddMenu(title)}
            className="bg-indigo-100 text-indigo-500 p-1.5 rounded-full hover:bg-indigo-200 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={idx}
                className={`flex justify-between items-center p-2.5 rounded-xl border transition-all ${isItemChecked(item)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleCheckClick(e, item)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isItemChecked(item)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                  >
                    {isItemChecked(item) ? <Check size={14} /> : <Square size={14} />}
                  </button>
                  <div>
                    <span className={`block text-sm font-medium ${isItemChecked(item) ? 'text-green-700 line-through' : 'text-slate-700'
                      }`}>
                      {item.food_name || item.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.calories || item.food_calories} kcal
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </li>
            ))}
          </ul>
        ) : (
          <div
            onClick={() => handleAddMenu(title)}
            className="py-4 border-2 border-dashed border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Utensils size={16} className="text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">메뉴 추가하기</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <span className="block text-sm text-slate-500 mb-1">{isMobile ? '모바일' : 'PC'}</span>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
          <span className="text-indigo-900">{user?.username || '사용자'}</span>님 안녕하세요.
        </h1>
      </header>

      <div className="px-5 space-y-5">

        {/* Assistant Message */}
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-3 text-slate-800 shadow-sm border border-indigo-100/50 flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-black-100 text-base font-bold">식단을 잘 지키고 있어요 👍</p>
          </div>
        </section>

        {/* Compact Nutrition Graph (One Graph) */}
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50">
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-bold text-slate-800 text-sm">오늘의 섭취</h2>
            <div className="text-right flex items-end justify-end gap-1">
              <span className="text-lg font-extrabold text-slate-800 leading-none">{currentCal}</span>
              <span className="text-[10px] text-slate-400 font-medium mb-0.5">/ {goals.calories} kcal</span>
            </div>
          </div>

          {/* Stacked Bar Graph */}
          {/* Total width represents Goal. Filled width represents Calories (C+P+F) */}
          <div className="h-6 w-full bg-indigo-50 rounded-full overflow-hidden flex relative border border-indigo-100/50 shadow-inner">
            {/* The segments add up to total calories consumed */}
            <div className="h-full bg-indigo-400 transition-all duration-1000" style={{ width: `${widthCarbs}%` }} />
            <div className="h-full bg-purple-400 transition-all duration-1000" style={{ width: `${widthProtein}%` }} />
            <div className="h-full bg-pink-400 transition-all duration-1000" style={{ width: `${widthFat}%` }} />
          </div>

          {/* Legend */}
          <div className="flex w-full justify-between items-center mt-3 px-1">
            {/* Explicit Calorie Legend Item Removed */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">탄수화물</span>
                <span className="text-base font-extrabold text-slate-800">{currentCarbs}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">단백질</span>
                <span className="text-base font-extrabold text-slate-800">{currentProtein}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">지방</span>
                <span className="text-base font-extrabold text-slate-800">{currentFat}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meal Plan Planning */}
        <section className="space-y-3 bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-slate-800 text-base">식단 계획 제공</h2>
          </div>
          <div className="grid gap-3">
            <PlanSection title="아침" type="breakfast" items={dietPlan?.breakfast ? [dietPlan.breakfast] : []} />
            <PlanSection title="점심" type="lunch" items={dietPlan?.lunch ? [dietPlan.lunch] : []} />
            <PlanSection title="저녁" type="dinner" items={dietPlan?.dinner ? [dietPlan.dinner] : []} />
          </div>
        </section>

        <FloatingCameraButton />
      </div>
    </div>
  );
}
