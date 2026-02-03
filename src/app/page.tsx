"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { Plus, ChevronRight, Utensils } from "lucide-react"
import { User } from "@/types/definitions"
import { getUser } from "@/api/index"

/*interface MealPlan {
  breakfast: any[];
  lunch: any[];
  dinner: any[];
  snack: any[];
}*/

export default function Mainpage() {
  const { isMobile } = useViewport();
  const router = useRouter();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /*const [mealPlan, setMealPlan] = useState<MealPlan>({
    breakfast: [], lunch: [], dinner: [], snack: []
  });*/

  // 로그인 체크 및 유저 정보 가져오기
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.push("/login");
      return;
    }

    console.log("Fetching user info for ID:", userId); // 디버깅 로그
    getUser(userId)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        console.log("User API Response:", data); // 디버깅 로그
        if (data) setUser(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("User fetch error", err);
        setIsLoading(false);
      });
  }, [router]);

  // 로딩 중이면 빈 화면
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">로딩 중...</div>;
  }

  // Handlers
  const handleAddMenu = (type: string) => {
    // 이 부분에 추후 엔드포인트, API 연결하여 이동 기능 추가 예정
  };

  const PlanSection = ({ title, type, items }: { title: string, type: string, items: any[] }) => (
    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-700">{title}</h3>
        <button
          onClick={() => handleAddMenu(title)}
          className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white p-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
        </button>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleAddMenu(`${title} 상세`)}
              className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-white/50 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div>
                <span className="block text-sm font-medium text-slate-700">{item.food_name || item.name}</span>
                <span className="text-xs text-slate-400">{item.calories || item.food_calories} kcal</span>
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

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <span className="block text-sm text-slate-500 mb-1">{isMobile ? '모바일' : 'PC'}</span>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.username || '사용자'}</span>님 안녕하세요.
        </h1>
      </header>

      <div className="px-5 space-y-5">

        {/* Assistant Message */}
        <section className="bg-gradient-to-br from-sky-200 via-pink-200 to-yellow-200 rounded-xl p-3 text-slate-800 shadow-sm border border-white/50 flex items-center gap-3">
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
        <section className="bg-gradient-to-br from-sky-200 via-pink-200 to-yellow-200 rounded-2xl p-5 shadow-sm border border-white/50">
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-bold text-slate-800 text-sm">오늘의 섭취</h2>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-800">{/*nutrition.calories.current*/}</span>
              <span className="text-xs text-slate-400"> {/*nutrition.calories.goal*/} kcal</span> {/* 그래프 오른쪽 상단 칼로리 표시 따로 할 필요 없으면 삭제할 것. */}
            </div>
          </div>

          {/* Stacked Bar Graph */}
          {/* Total width represents Goal. Filled width represents Calories (C+P+F) */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
            {/* The segments add up to total calories consumed */}
            <div className="h-full bg-blue-500" style={{ width: `0%` }} />
            <div className="h-full bg-emerald-500" style={{ width: `0%` }} />
            <div className="h-full bg-amber-500" style={{ width: `0%` }} />
          </div>

          {/* Legend */}
          <div className="flex w-full justify-between items-center mt-3 px-1">
            {/* Explicit Calorie Legend Item */}
            <div className="flex items-center gap-1.5">
              {/* Using a multi-color dot or neutral dot for Total */}
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
              <span className="text-[10px] text-slate-500 font-medium">칼로리 {/*nutrition.calories.current*/}kcal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-slate-500">탄수화물 {/*nutrition.carbs*/}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-slate-500">단백질 {/*nutrition.protein*/}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-[10px] text-slate-500">지방 {/*nutrition.fat*/}g</span>
            </div>
          </div>
        </section>

        {/* Meal Plan Planning */}
        <section className="space-y-3 bg-gradient-to-br from-sky-200 via-pink-200 to-yellow-200 rounded-2xl p-5 shadow-sm border border-white/50">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-slate-800 text-base">식단 계획 제공</h2>
          </div>
          <div className="grid gap-3">
            <PlanSection title="아침" type="breakfast" items={[]} />
            <PlanSection title="점심" type="lunch" items={[]} />
            <PlanSection title="저녁" type="dinner" items={[]} />
          </div>
        </section>

        <FloatingCameraButton />
      </div>
    </div>
  );
}
