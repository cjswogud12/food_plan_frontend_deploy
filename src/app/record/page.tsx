"use client";

import { useState, useEffect, useRef } from "react";
import { useViewport } from "@/context/ViewportContext";
import FloatingCameraButton from "@/components/FloatingCameraButton";
import CalendarFull from "@/components/MainCalendarFull";
import { FoodAnalysisResult } from "@/types/definitions";
import { getRecord, uploadFoodImage } from "@/api/index";
import RecordMealGroup from "@/components/record/RecordMealGroup";

// 식단 데이터를 끼니별로 분류하기 위한 타입
interface DailyMealData {
  breakfast: FoodAnalysisResult[];
  lunch: FoodAnalysisResult[];
  dinner: FoodAnalysisResult[];
  snack: FoodAnalysisResult[];
}

// ✅ 백엔드 주소 (나중에 env로 빼는 걸 추천)
const API_ORIGIN = "http://localhost:8000";

/**
 * ✅ 백엔드 /api/record 응답(배열)을 끼니별로 그룹핑
 * + image_url이 "/uploads/..."면 절대 URL로 바꿔줌
 */
function groupByMealType(rows: any[]): DailyMealData {
  const grouped: DailyMealData = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  if (!Array.isArray(rows)) return grouped;

  for (const r of rows) {
    const mt = r.meal_type as keyof DailyMealData;

    // image_url 보정: "/uploads/foods/xxx.jpg" -> "http://localhost:8000/uploads/foods/xxx.jpg"
    const fixed = {
      ...r,
      image_url:
        typeof r.image_url === "string" && r.image_url.startsWith("/uploads/")
          ? `${API_ORIGIN}${r.image_url}`
          : r.image_url,
    };

    if (mt && grouped[mt]) grouped[mt].push(fixed);
  }

  return grouped;
}

export default function RecordPage() {
  const { isMobile } = useViewport();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealData, setMealData] = useState<DailyMealData>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  // 각 시간 별 음식 저장
  const fileInputRefs = {
    breakfast: useRef<HTMLInputElement>(null),
    lunch: useRef<HTMLInputElement>(null),
    dinner: useRef<HTMLInputElement>(null),
    snack: useRef<HTMLInputElement>(null),
  };

  // + 버튼 클릭 시 파일 선택 창 열기
  const handleAddMeal = (mealType: keyof typeof fileInputRefs) => {
    fileInputRefs[mealType].current?.click();
  };

  // 날짜 -> YYYY-MM-DD
  const toDateString = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  // ✅ 특정 날짜 기록 fetch
  const fetchRecords = async (d: Date) => {
    const dateString = toDateString(d);

    try {
      const response = await getRecord(dateString);
      if (!response.ok) throw new Error("Failed to fetch records");

      const data = await response.json();

      // ✅ 여기서 배열 -> 끼니별 + image_url 보정
      setMealData(groupByMealType(data));
    } catch (error) {
      console.error("Fetch Error", error);
      setMealData({ breakfast: [], lunch: [], dinner: [], snack: [] });
    }
  };

  // 파일 선택 후 업로드 처리
  const handleFileUpload = async (mealType: keyof typeof fileInputRefs, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("meal_type", mealType);

    const userId = localStorage.getItem("user_id");
    if (userId) formData.append("user_number", userId);

    try {
      const response = await uploadFoodImage(formData);

      if (response.ok) {
        alert("음식 등록 완료!");
        // ✅ 업로드 후 새로고침
        await fetchRecords(selectedDate);
      } else {
        alert("업로드 실패");
      }
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  // Calculate Totals
  const allRecords = [
    ...mealData.breakfast,
    ...mealData.lunch,
    ...mealData.dinner,
    ...mealData.snack,
  ];

  // ✅ 백엔드 필드명(food_*) 기준으로 합산 (estimated_* 쓰면 계속 0 나올 수 있음)
  const totalCalories = allRecords.reduce((sum: number, r: any) => sum + (r.food_calories || 0), 0);
  const totalCarbs = allRecords.reduce((sum: number, r: any) => sum + (r.food_carbs || 0), 0);
  const totalProteins = allRecords.reduce((sum: number, r: any) => sum + (r.food_protein || 0), 0);
  const totalFats = allRecords.reduce((sum: number, r: any) => sum + (r.food_fats || 0), 0);

  // API Fetch for Selected Date
  useEffect(() => {
    fetchRecords(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="w-full h-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-blue-200 flex flex-col overflow-y-auto">
      <div className="p-4 max-w-md mx-auto w-full pb-24">
        {/* Header */}
        <header className="mb-6 pt-4">
          <span className="block text-sm text-slate-500 mb-1">
            {isMobile ? "모바일" : "PC"}
          </span>
          <h1 className="text-2xl font-bold text-slate-800">기록</h1>
        </header>

        {/* Full Calendar */}
        <section className="mb-6">
          <CalendarFull selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </section>

        {/* Daily Summary (Single Line) */}
        <section className="bg-purple-600 rounded-2xl p-4 text-white mb-6 shadow-lg shadow-purple-200">
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col items-center px-2 border-r border-purple-400/50 flex-1">
              <span className="text-purple-200 text-xs mb-0.5">총 칼로리</span>
              <span className="font-bold">{totalCalories} kcal</span>
            </div>
            <div className="flex flex-col items-center px-2 border-r border-purple-400/50 flex-1">
              <span className="text-purple-200 text-xs mb-0.5">탄수화물</span>
              <span className="font-bold">{totalCarbs}g</span>
            </div>
            <div className="flex flex-col items-center px-2 border-r border-purple-400/50 flex-1">
              <span className="text-purple-200 text-xs mb-0.5">단백질</span>
              <span className="font-bold">{totalProteins}g</span>
            </div>
            <div className="flex flex-col items-center px-2 flex-1">
              <span className="text-purple-200 text-xs mb-0.5">지방</span>
              <span className="font-bold">{totalFats}g</span>
            </div>
          </div>
        </section>

        {/* Meal Lists - 2x2 Grid */}
        <section className="grid grid-cols-2 gap-3 pb-8">
          <RecordMealGroup title="아침" records={mealData.breakfast} onAddClick={() => handleAddMeal("breakfast")} />
          <RecordMealGroup title="점심" records={mealData.lunch} onAddClick={() => handleAddMeal("lunch")} />
          <RecordMealGroup title="저녁" records={mealData.dinner} onAddClick={() => handleAddMeal("dinner")} />
          <RecordMealGroup title="간식" records={mealData.snack} onAddClick={() => handleAddMeal("snack")} />
        </section>

        {/* 각 시간 별 음식 저장 */}
        {Object.entries(fileInputRefs).map(([type, ref]) => (
          <input
            key={type}
            type="file"
            ref={ref}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(type as keyof typeof fileInputRefs, file);
              e.currentTarget.value = "";
            }}
          />
        ))}

        <FloatingCameraButton />
      </div>
    </div>
  );
}
