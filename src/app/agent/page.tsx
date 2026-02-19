"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { Home, Building2, ChevronRight, Utensils, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUser, getUserGoal, getTodayIntake, fetchMenuSave, getUserAddress } from "@/api/index"
import { useUserStore, useDietStore } from "@/store"
import { DietPlanKakaoMap, Restaurant, RestaurantMenuItem } from "@/types/definitions"
import AgentFoodItem from "@/components/agent/Mainagent"



export default function Mainpage() {
  const { isMobile } = useViewport();
  const router = useRouter();

  // Zustand Store 전역 상태관리
  const { user, setUser, setUserGoal } = useUserStore();
  const { todayIntake, setTodayIntake, checkedMeals, toggleMealCheck, resetDiet, currentMealSlide, setCurrentMealSlide } = useDietStore();

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Local State 로컬 상태관리
  const [isLoading, setIsLoading] = useState(!user);
  const [locationMode, setLocationMode] = useState<"home" | "company">("home");

  // Restaurant 추천 데이터 상태
  const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Map State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapData, setMapData] = useState<DietPlanKakaoMap | null>(null);



  // 식단 카드 데이터
  const mealCards = [
    { key: "breakfast" as const, title: "아침 식단", icon: "☀️" },
    { key: "lunch" as const, title: "점심 식단", icon: "🌤️" },
    { key: "dinner" as const, title: "저녁 식단", icon: "🌙" },
  ];

  // 3D Carousel 상태
  const [rotationAngle, setRotationAngle] = useState(0);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchDelta.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchDelta.current = currentX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const threshold = 50;
    if (touchDelta.current < -threshold) {
      const nextSlide = (currentMealSlide + 1) % mealCards.length;
      setRotationAngle(prev => prev - 120);
      setCurrentMealSlide(nextSlide);
    } else if (touchDelta.current > threshold) {
      const prevSlide = (currentMealSlide - 1 + mealCards.length) % mealCards.length;
      setRotationAngle(prev => prev + 120);
      setCurrentMealSlide(prevSlide);
    }
    touchDelta.current = 0;
  }, [currentMealSlide, setCurrentMealSlide, mealCards.length]);

  // 로그인 체크 및 유저 정보 가져오기
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
        if (goalRes.ok) {
          const goalData = await goalRes.json();
          setUserGoal(goalData);
        } else if (goalRes.status === 404) {
          setUserGoal(null);
          resetDiet();
        }

      } catch (err) {
        console.error("Failed to fetch main page data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, setUser]);

  // 오늘의 섭취 정보 가져오기
  useEffect(() => {
    if (!user) return;
    // 오늘의 섭취 정보 (이미 데이터 있으면 스킵 가능하지만, 최신화 위해 호출)
    // ... logic ...
    if (user && !todayIntake) {
      console.log("Fetching todayIntake...");
      getTodayIntake()
        .then(res => {
          console.log("getTodayIntake response status:", res.status);
          return res.ok ? res.json() : null;
        })
        .then(data => {
          console.log("getTodayIntake data:", data);
          if (data) setTodayIntake(data);
        })
        .catch(err => console.error("getTodayIntake error:", err));
    }
  }, [user]);

  // 식당 메뉴 추천 데이터 가져오기 (집/회사 모드에 따라 전환)
  useEffect(() => {
    if (!user) return;

    const fetchAndSetRestaurantData = async () => {
      let addressText = "";

      // 1. localStorage 우선 확인
      const savedLocations = localStorage.getItem("user_locations");
      if (savedLocations) {
        try {
          const locations = JSON.parse(savedLocations);
          if (Array.isArray(locations)) {
            const target = locations.find((loc: any) => loc.label === locationMode);
            if (target && target.address_text) {
              addressText = target.address_text;
            }
          }
        } catch (e) {
          console.error("localStorage 파싱 에러", e);
        }
      }

      // 2. localStorage에 없으면 서버에서 가져오기
      if (!addressText && user.user_number) {
        try {
          const res = await getUserAddress(user.user_number);
          if (res.ok) {
            const data = await res.json();
            // server response: { user_number, home_address, company_address }
            if (locationMode === "home" && data.home_address) {
              addressText = data.home_address;
            } else if (locationMode === "company" && data.company_address) {
              addressText = data.company_address;
            }
          }
        } catch (e) {
          console.error("주소 정보 가져오기 실패", e);
        }
      }

      if (!addressText) {
        console.log(`${locationMode === "home" ? "집" : "회사"} 주소 정보가 없습니다.`);
        setRestaurantData(null);
        return;
      }

      // 3. fetchMenuSave 호출 (식당 데이터 가져오기)
      setIsRestaurantLoading(true);
      try {
        const res = await fetchMenuSave(
          locationMode,
          addressText,
          undefined, // lat
          undefined, // lng
          500 // radius 기본값
        );
        if (res.ok) {
          const data = await res.json();
          console.log(`[${locationMode}] 식당 추천 데이터:`, data);
          setRestaurantData(data);
        }
      } catch (err) {
        console.error("식당 추천 데이터 가져오기 실패:", err);
      } finally {
        setIsRestaurantLoading(false);
      }
    };

    fetchAndSetRestaurantData();
  }, [user, locationMode]);

  // Store Hydration Sync: 상태가 복구되면 로딩 해제
  useEffect(() => {
    if (user) setIsLoading(false);
  }, [user]);

  // 로딩 중이면 빈 화면
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">로딩 중...</div>;
  }

  // 빈 깡통 음식 아이템 컴포넌트 (로딩/폴백용)
  const PlaceholderFoodItem = () => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
      <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="h-3 bg-slate-100 rounded w-20" />
      </div>
    </div>
  );

  // 체크 토글 핸들러
  const handleCheckItem = (menuId: number, mealType: "breakfast" | "lunch" | "dinner", item: RestaurantMenuItem) => {
    // 1. UI용 로컬 체크 상태 토글
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });

    // 2. Store에 음식 데이터 저장 → Record 페이지 연동
    const foodData = {
      food_name: item.menu_name,
      calories_kcal: item.calories_kcal,
      carbs_g: item.carbs_g,
      protein_g: item.protein_g,
      fat_g: item.fat_g,
      restaurant_name: item.restaurant_name,
      price: item.price,
    };
    toggleMealCheck(today, mealType, foodData);
  };

  // 식사 타입별 메뉴 아이템 가져오기
  const getMealItems = (mealKey: "breakfast" | "lunch" | "dinner"): RestaurantMenuItem[] => {
    if (!restaurantData) return [];
    return restaurantData[mealKey] || [];
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <span className="block text-sm text-slate-500 mb-1">{isMobile ? '모바일' : 'PC'}</span>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
          <span className="text-indigo-900">{user?.username || '사용자'}</span>님 안녕하세요.
        </h1>
      </header>

      <div className="px-5 space-y-5 flex-1 flex flex-col">

        {/* Assistant Message */}
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-3 text-slate-800 shadow-sm border border-indigo-100/50 flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-black-100 text-base font-bold">
              {(() => {
                const todayChecks = checkedMeals[today] || { breakfast: [], lunch: [], dinner: [] };
                const hasBreakfast = todayChecks.breakfast?.length > 0;
                const hasLunch = todayChecks.lunch?.length > 0;
                const hasDinner = todayChecks.dinner?.length > 0;

                if (hasDinner) return "완벽해요! 오늘 하루도 고생하셨어요 👏";
                if (hasLunch) return "잘하고 있어요! 저녁까지 힘내봐요 💪";
                if (hasBreakfast) return "아침식사를 하셨군요! 활기찬 하루 되세요 ☀️";
                return "식단을 잘 지키고 있어요 👍";
              })()}
            </p>
          </div>
        </section>

        {/* Compact Nutrition Graph (One Graph) */}
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50">
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-bold text-slate-800 text-sm">오늘의 섭취</h2>
            <div className="text-right flex items-end justify-end gap-1">
              <span className="text-lg font-extrabold text-slate-800 leading-none">{Math.round(todayIntake?.total_calories_kcal || 0)}</span>
              <span className="text-[10px] text-slate-400 font-medium mb-0.5">kcal</span>
            </div>
          </div>

          {/* Stacked Bar Graph Logic */}
          {(() => {
            const carbs = todayIntake?.total_carbs_g || 0;
            const protein = todayIntake?.total_protein_g || 0;
            const fat = todayIntake?.total_fat_g || 0;
            const totalGrams = carbs + protein + fat || 1; // Prevent division by zero

            const carbsPercent = (carbs / totalGrams) * 100;
            const proteinPercent = (protein / totalGrams) * 100;
            const fatPercent = (fat / totalGrams) * 100;

            return (
              <div className="h-6 w-full bg-indigo-50 rounded-full overflow-hidden flex relative border border-indigo-100/50 shadow-inner">
                <div className="h-full bg-indigo-400 transition-all duration-500 ease-in-out" style={{ width: `${carbsPercent}%` }} />
                <div className="h-full bg-purple-400 transition-all duration-500 ease-in-out" style={{ width: `${proteinPercent}%` }} />
                <div className="h-full bg-pink-400 transition-all duration-500 ease-in-out" style={{ width: `${fatPercent}%` }} />
              </div>
            );
          })()}

          {/* Legend */}
          <div className="flex w-full justify-between items-center mt-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">탄수화물</span>
                <span className="text-base font-extrabold text-slate-800">{Math.round(todayIntake?.total_carbs_g || 0)}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">단백질</span>
                <span className="text-base font-extrabold text-slate-800">{Math.round(todayIntake?.total_protein_g || 0)}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">지방</span>
                <span className="text-base font-extrabold text-slate-800">{Math.round(todayIntake?.total_fat_g || 0)}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meal Plan Planning — 3D Rotary Carousel */}
        <section className="flex-1 space-y-3 bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-3 pt-5 pb-4 shadow-sm border border-indigo-100/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-slate-800 text-base">식단 계획 제공</h2>
            {/* 집/회사 모드 전환 토글 */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <Button
                variant={locationMode === "home" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLocationMode("home")}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md gap-1 transition-all ${locationMode === "home"
                  ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                  }`}
              >
                <Home size={13} />
                집
              </Button>
              <Button
                variant={locationMode === "company" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLocationMode("company")}
                className={`h-7 px-2.5 text-xs font-semibold rounded-md gap-1 transition-all ${locationMode === "company"
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                  }`}
              >
                <Building2 size={13} />
                회사
              </Button>
            </div>
            {/* 슬라이드 인디케이터 */}
            <div className="flex gap-2">
              {mealCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i - currentMealSlide;
                    setRotationAngle(prev => prev - diff * 120);
                    setCurrentMealSlide(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentMealSlide
                    ? 'bg-indigo-500 scale-150 shadow-lg shadow-indigo-300'
                    : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* 3D Rotary Carousel */}
          <div
            className="relative flex-1 select-none mt-5"
            style={{ perspective: '600px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <div
              className="w-full h-full relative"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `rotateY(${rotationAngle}deg)`,
              }}
            >
              {mealCards.map((meal, i) => {
                const angle = i * 120;
                const isActive = i === currentMealSlide;
                return (
                  <div
                    key={meal.key}
                    className="absolute top-0 left-0 right-0 bottom-0 w-full px-1 flex flex-col"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(50px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className={`
                      h-full rounded-2xl p-3 flex flex-col gap-2 transition-all duration-500
                      ${isActive
                        ? 'bg-white/90 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50'
                        : 'bg-white/60 border border-slate-200/50 shadow-md opacity-70'
                      }
                    `}>
                      {/* Card Header */}
                      <div className="flex items-center gap-2 px-1 shrink-0">
                        <span className="text-xl">{meal.icon}</span>
                        <span className="font-bold text-base text-slate-800">{meal.title}</span>
                      </div>

                      {/* Card Content */}
                      <div className="relative flex-1 min-h-0">
                        <div className="h-full overflow-y-auto space-y-2 px-2 pb-10 [&::-webkit-scrollbar]:hidden">
                          {isRestaurantLoading ? (
                            <>
                              <PlaceholderFoodItem />
                              <PlaceholderFoodItem />
                              <PlaceholderFoodItem />
                            </>
                          ) : getMealItems(meal.key).length > 0 ? (
                            getMealItems(meal.key).map((item) => (
                              <AgentFoodItem
                                key={item.menu_id}
                                item={item}
                                isChecked={checkedItems.has(item.menu_id)}
                                onCheck={() => handleCheckItem(item.menu_id, meal.key, item)}
                              />
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-4">추천 메뉴가 없습니다</p>
                          )}
                        </div>
                        {/* Blur Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <FloatingCameraButton />
      </div>
    </div>
  );
}
