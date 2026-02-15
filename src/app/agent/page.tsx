"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import DietMapModal from "@/components/DietMapModal"
import { ChevronRight, Utensils, Square, MapPin, Home, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUser, getDietplan, getUserGoal, getTodayIntake, getNearbyPlaces, fetchMenuSave } from "@/api/index"
import { useUserStore, useDietStore } from "@/store"
import { DietPlanKakaoMap, Restaurant, RestaurantMenuItem } from "@/types/definitions"
import AgentFoodItem from "@/components/agent/Mainagent"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"



export default function Mainpage() {
  const { isMobile } = useViewport();
  const router = useRouter();

  // Zustand Store 전역 상태관리
  const { user, setUser, setUserGoal } = useUserStore();
  const { dietPlan, setDietPlan, todayIntake, setTodayIntake, lastFetched, checkedMeals, toggleMealCheck, resetDiet, currentMealSlide, setCurrentMealSlide } = useDietStore();

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Local State 로컬 상태관리
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

  // Restaurant 추천 데이터 상태
  const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
  const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // 집/회사 모드 전환 상태
  const [locationMode, setLocationMode] = useState<"home" | "company">("home");

  // Carousel API State
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // 식단 카드 데이터
  const mealCards = [
    { key: "breakfast" as const, title: "아침 식단", icon: "☀️" },
    { key: "lunch" as const, title: "점심 식단", icon: "🌤️" },
    { key: "dinner" as const, title: "저녁 식단", icon: "🌙" },
  ];

  // Carousel API와 Zustand 슬라이드 상태 동기화
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentMealSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    // 저장된 슬라이드로 초기 위치 설정
    if (currentMealSlide > 0) {
      carouselApi.scrollTo(currentMealSlide);
    }

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, setCurrentMealSlide]);

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
    if (user && (!dietPlan || !lastFetched || (Date.now() - lastFetched > ONE_HOUR))) {
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
          if (data.plan?.days?.length > 0) {
            setDietPlan(data.plan.days[0]);
          } else if (data.plan?.days?.length > 0) {
            setDietPlan(data.days[0]);
          } else {
            console.log("응답에서 days 가 읎다아ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏ!!!!")
          }
          // ✅ 백엔드 응답에 today_intake가 포함되어 있다면 바로 상태 업데이트
          if (data.today_intake) {
            setTodayIntake(data.today_intake);
          }
        }
        )
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

  // 식당 메뉴 추천 데이터 가져오기 (집/회사 모드에 따라 전환)
  useEffect(() => {
    if (!user) return;

    // 온보딩에서 저장한 주소 데이터 읽기
    const savedLocations = localStorage.getItem("user_locations");
    if (!savedLocations) {
      console.log("저장된 주소 정보가 없습니다. 온보딩을 완료해주세요.");
      return;
    }

    const locations = JSON.parse(savedLocations);
    const targetLocation = locations.find((loc: any) => loc.label === locationMode);
    if (!targetLocation) {
      console.log(`${locationMode === "home" ? "집" : "회사"} 주소 정보가 없습니다.`);
      setRestaurantData(null);
      return;
    }

    const fetchRestaurantData = async () => {
      setIsRestaurantLoading(true);
      try {
        const res = await fetchMenuSave(
          targetLocation.label,
          targetLocation.address_text,
          0,  // lat: 백엔드에서 geocoding 처리
          0,  // lng: 백엔드에서 geocoding 처리
          targetLocation.radius_m || 500
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

    fetchRestaurantData();
  }, [user, locationMode]);

  // Store Hydration Sync: 상태가 복구되면 로딩 해제
  useEffect(() => {
    if (user) setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (dietPlan) {
      console.log("현재 다이어트플랜 상태:", dietPlan);
      console.log("다이어트 계획 아침:", dietPlan.breakfast);
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
  const handleCheckItem = (menuId: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
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

        {/* Meal Plan Planning — Carousel */}
        <section className="space-y-3 bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-3 shadow-sm border border-indigo-100/50 flex flex-col">
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
          </div>

          {/* 슬라이드 인디케이터 */}
          <div className="flex justify-center gap-2 pb-1">
            {mealCards.map((_, i) => (
              <button
                key={i}
                onClick={() => carouselApi?.scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentMealSlide
                  ? 'bg-indigo-500 scale-125'
                  : 'bg-slate-300 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>

          {/* 카드 Carousel */}
          <div className="flex-1">
            <Carousel
              setApi={setCarouselApi}
              opts={{ align: "center", loop: false }}
              className="w-full h-full"
            >
              <CarouselContent className="-ml-2 h-full">
                {mealCards.map((meal) => (
                  <CarouselItem key={meal.key} className="pl-2 h-full">
                    <Card className="border-2 border-indigo-50 shadow-sm h-full py-4 gap-3">
                      <CardHeader className="pb-0 pt-0 px-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <span className="text-lg">{meal.icon}</span>
                          <span className="text-slate-700">{meal.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 px-4">
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
                              onCheck={() => handleCheckItem(item.menu_id)}
                              onClick={() => handleFoodClick(item.menu_name)}
                            />
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm">
                            추천 메뉴가 없습니다
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1 size-7 border-indigo-200 text-indigo-500 hover:bg-indigo-50" />
              <CarouselNext className="right-1 size-7 border-indigo-200 text-indigo-500 hover:bg-indigo-50" />
            </Carousel>
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
