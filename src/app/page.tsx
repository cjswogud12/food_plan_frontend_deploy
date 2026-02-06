"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import DietMapModal from "@/components/DietMapModal" // Import New Modal
import { Plus, ChevronRight, Utensils, Check, Square, MapPin } from "lucide-react"
import { getUser, getDietplan, getUserGoal, getTodayIntake, getNearbyPlaces } from "@/api/index" // Import API
import { useUserStore, useDietStore } from "@/store"
import { DietPlanKakaoMap } from "@/types/definitions" // Import Type

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
  const { user, setUser, setUserGoal } = useUserStore();
  const { dietPlan, setDietPlan, todayIntake, setTodayIntake, lastFetched, checkedMeals, toggleMealCheck, resetDiet } = useDietStore();

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Local State 로컬 상태관리
  // 유저 정보가 이미 있으면 로딩 안 함 (Immediate Display)
  // 유저 정보가 이미 있으면 로딩 안 함 (Immediate Display)
  const [isLoading, setIsLoading] = useState(!user);
  // dietPlan이 없으면 로딩 상태로 시작 (Hydration Flicker 방지)
  const [isPlanLoading, setIsPlanLoading] = useState(!dietPlan);

  // Skeleton UI Component
  const PlanSkeleton = () => (
    <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl shadow-sm animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-slate-200 rounded w-12"></div>
        <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>
        ))}
      </div>
    </div>
  );

  // Map State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapData, setMapData] = useState<DietPlanKakaoMap | null>(null);

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
          // 목표 없음 - UI 초기화
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

  // 식단 계획 및 오늘의 섭취 정보 가져오기 (User Store 의존)
  useEffect(() => {
    if (!user) return;

    const ONE_HOUR = 60 * 60 * 1000;

    // 식단 계획
    // user가 있고, (데이터가 없거나 || 마지막 갱신으로부터 1시간 지났으면)
    // Infinite loop fix: ensure we don't fetch if we simply just set it. 
    // The previous logic relied on dietPlan being falsey to fetch.
    if (user && (!dietPlan || (lastFetched && Date.now() - lastFetched > ONE_HOUR))) {
      // 데이터가 아예 없을 때만 로딩 표시 (Stale-While-Revalidate)
      if (!dietPlan) setIsPlanLoading(true);

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
          console.log("API Response Data:", data);

          // Data structure fix: plan is nested in 'plan' property
          if (data.plan?.days?.length > 0) {
            setDietPlan(data.plan.days[0]);
          } else if (data.days?.length > 0) {
            setDietPlan(data.days[0]);
          } else {
            console.warn("No diet plan days found in response");
          }

          // ✅ 백엔드 응답에 today_intake가 포함되어 있다면 바로 상태 업데이트
          if (data.today_intake) {
            setTodayIntake(data.today_intake);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsPlanLoading(false)); // 로딩 끝
    }

    // 오늘의 섭취 정보 (이미 데이터 있으면 스킵 가능하지만, 최신화 위해 호출)
    // ... logic ...
    if (user && !todayIntake) {
      getTodayIntake()
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setTodayIntake(data);
        })
        .catch(err => console.error(err));
    }
  }, [user, lastFetched]);

  // Store Hydration Sync: 상태가 복구되면 로딩 해제
  useEffect(() => {
    if (user) setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (dietPlan) {
      console.log("Current dietPlan state:", dietPlan);
      console.log("dietPlan.breakfast:", dietPlan.breakfast);
      setIsPlanLoading(false);
    }
  }, [dietPlan]);

  // 로딩 중이면 빈 화면
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">로딩 중...</div>;
  }

  // Handlers
  const handleAddMenu = (type: string) => {
    // 이 부분에 추후 엔드포인트, API 연결하여 이동 기능 추가 예정
  };

  const handleFoodClick = async (foodName: string) => {
    if (!navigator.geolocation) {
      alert("위치 정보를 사용할 수 없습니다.");
      return;
    }

    // Show loading or toast could be added here
    console.log("📍 Obtaining user location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          console.log(`📍 Location obtained: ${latitude}, ${longitude}`);

          // Fetch nearby places
          console.log(`🍽️ Fetching places for: ${foodName}`);
          const data = await getNearbyPlaces(foodName, latitude, longitude);
          console.log("📦 API Response:", data);

          // The backend returns a structure. Depending on current impl, adapt it.
          // Assuming backend returns { ...data } matching DietPlanKakaoMap
          // Or if it returns { places: [] }, we might need to construct the object.
          // Let's assume response IS the DietPlanKakaoMap object structure or close to it.
          // User showed "ResponseData" has "places": [...].
          // We need to form DietPlanKakaoMap structure: { food_name, place, lat, lng, radius_m }

          const places = data.place || data.places || [];
          console.log(`✅ Found ${places.length} places`);

          const mapPayload: DietPlanKakaoMap = {
            food_name: foodName,
            lat: latitude,
            lng: longitude,
            radius_m: 2000,
            place: places // Handle backend response key
          };

          setMapData(mapPayload);
          setIsMapOpen(true);
        } catch (error) {
          console.error("❌ Error in handleFoodClick:", error);
          alert("장소 정보를 가져오는데 실패했습니다.");
        }
      },
      (error) => {
        console.error("Location error:", error);
        alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
      }
    );
  };

  // 로딩 중이면 빈 화면
  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">로딩 중...</div>;
  }

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
                // Click handler for opening map
                onClick={() => handleFoodClick(item.food_name || item.name)}
                className={`flex justify-between items-center p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isItemChecked(item)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleCheckClick(e, item)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0 ${isItemChecked(item)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                  >
                    {isItemChecked(item) ? <Check size={14} /> : <Square size={14} />}
                  </button>

                  {/* Food Image */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.food_name || item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Utensils size={16} className="text-slate-300" />
                    </div>
                  )}

                  <div>
                    <span className={`block text-sm font-medium ${isItemChecked(item) ? 'text-green-700 line-through' : 'text-slate-700'
                      }`}>
                      {item.food_name || item.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <span>{item.calories || item.food_calories || item.calories_kcal} kcal</span>
                      <span className="text-indigo-400 flex items-center gap-0.5 ml-1 bg-indigo-50 px-1 rounded">
                        <MapPin size={10} /> 지도보기
                      </span>
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

  const getMealItems = (mealData: any) => {
    if (!mealData) return [];
    return Array.isArray(mealData) ? mealData : [mealData];
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
              <span className="text-lg font-extrabold text-slate-800 leading-none">{todayIntake?.total_calories_kcal}</span>
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
                <span className="text-base font-extrabold text-slate-800">{todayIntake?.total_carbs_g}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">단백질</span>
                <span className="text-base font-extrabold text-slate-800">{todayIntake?.total_protein_g}</span>
                <span className="text-[10px] text-slate-500">g</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-600">지방</span>
                <span className="text-base font-extrabold text-slate-800">{todayIntake?.total_fat_g}</span>
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
            {isPlanLoading && !dietPlan ? (
              <>
                <PlanSkeleton />
                <PlanSkeleton />
                <PlanSkeleton />
              </>
            ) : (
              <>
                <PlanSection title="아침" type="breakfast" items={getMealItems(dietPlan?.breakfast)} />
                <PlanSection title="점심" type="lunch" items={getMealItems(dietPlan?.lunch)} />
                <PlanSection title="저녁" type="dinner" items={getMealItems(dietPlan?.dinner)} />
              </>
            )}
          </div>
        </section>

        <FloatingCameraButton />

        {/* Map Modal */}
        <DietMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          data={mapData}
        />
      </div>
    </div>
  );
}
