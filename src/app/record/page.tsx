"use client";

import { useState, useEffect, useRef } from "react";
import { useViewport } from "@/context/ViewportContext";
import FloatingCameraButton from "@/components/FloatingCameraButton";
import CalendarFull from "@/components/MainCalendarFull";
import { Plus, ChevronRight, Utensils, Trash2 } from "lucide-react"
import { FoodAnalysisResult } from "@/types/definitions";
import { getRecord, uploadFoodImage, deleteDayRecords, deleteRecord, getCalendarRecord } from "@/api/index";
import RecordMealGroup from "@/components/record/RecordMealGroup";

// 식단 데이터를 끼니별로 분류하기 위한 타입
interface DailyMealData {
  breakfast: FoodAnalysisResult[];
  lunch: FoodAnalysisResult[];
  dinner: FoodAnalysisResult[];
  snack: FoodAnalysisResult[];
}

// ✅ 백엔드 주소 (나중에 env로 빼는 걸 추천)
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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
  const [recordedDays, setRecordedDays] = useState<string[]>([]); // 캘린더에 표시할 기록된 날짜들
  const [mealData, setMealData] = useState<DailyMealData>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  // 캘린더에서 식단 기록이 있는 날짜에 색상 추가
  // 월별 기록 데이터 가져오기 (캘린더용)
  const fetchMonthlyRecords = async (date: Date) => {
    try {
      const userNumberStr = localStorage.getItem("user_number");
      if (!userNumberStr) return;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const response = await getCalendarRecord(Number(userNumberStr), year, month);
      if (response.ok) {
        const data = await response.json();
        // data structure: { year: number, month: number, dates: string[] }
        if (data && Array.isArray(data.dates)) {
          setRecordedDays(data.dates);
        } else {
          setRecordedDays([]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch monthly records", e);
    }
  };

  // 초기 로드 시 현재 월의 기록 가져오기
  useEffect(() => {
    fetchMonthlyRecords(selectedDate);
  }, []);

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
      // 로컬스토리지에서 userNumber 가져오기 (없으면 undefined)
      const userNumberStr = localStorage.getItem("user_number");
      const userNumber = userNumberStr ? Number(userNumberStr) : undefined;

      const response = await getRecord(dateString, userNumber);
      if (!response.ok) throw new Error("Failed to fetch records");

      const data = await response.json();

      // ✅ 여기서 배열 -> 끼니별 + image_url 보정
      setMealData(groupByMealType(data));
    } catch (error) {
      console.error("Fetch Error", error);
      setMealData({ breakfast: [], lunch: [], dinner: [], snack: [] });
    }
  };

  // 삭제 핸들러
  const handleDeleteDate = async () => {
    if (!confirm("해당 날짜의 모든 기록을 삭제하시겠습니까?")) return;

    try {
      const userNumber = localStorage.getItem("user_number");
      const userNum = userNumber ? Number(userNumber) : undefined;
      await deleteDayRecords(toDateString(selectedDate), userNum);
      alert("삭제되었습니다.");
      fetchRecords(selectedDate); // Refresh
    } catch (error) {
      console.error("Delete Error", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 개별/일괄 기록 삭제 핸들러
  const handleDeleteRecord = async (recordIds: number | number[]) => {
    try {
      if (Array.isArray(recordIds)) {
        // 일괄 삭제
        await Promise.all(recordIds.map(id => deleteRecord(id)));
      } else {
        // 단일 삭제
        await deleteRecord(recordIds);
      }
      alert("삭제가 완료되었습니다.");
      fetchRecords(selectedDate);
    } catch (error) {
      console.error("Delete Record Error", error);
      alert("기록 삭제 실패");
    }
  };

  // 파일 선택 후 업로드 처리
  const handleFileUpload = async (mealType: keyof typeof fileInputRefs, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("meal_type", mealType);
    formData.append("record_date", toDateString(selectedDate));

    const userNumber = localStorage.getItem("user_number");
    if (userNumber) formData.append("user_number", userNumber);

    // 디버깅용 로그
    for (const p of formData.entries()) console.log(`[RecordPage] Upload: ${p[0]} = ${p[1]}`);

    try {
      const response = await uploadFoodImage(formData);

      if (response.ok) {
        alert("음식 등록 완료!");
        // ✅ 업로드 후 새로고침
        await fetchRecords(selectedDate);
      } else {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          alert(`업로드 실패: ${errorJson.detail || errorText}`);
        } catch {
          alert(`업로드 실패 (${response.status}): ${errorText}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  // API 데이터만 사용 (체크 기록은 백엔드에 저장되므로 getRecord로 이미 포함됨)
  const combinedMealData = mealData;

  const allRecords = [
    ...combinedMealData.breakfast,
    ...combinedMealData.lunch,
    ...combinedMealData.dinner,
    ...combinedMealData.snack,
  ];

  // ✅ 백엔드 필드명(food_*) 기준으로 합산 (estimated_* 쓰면 계속 0 나올 수 있음)
  const totalCalories = allRecords.reduce(
    (sum: number, r: any) => sum + (r.estimated_calorie_kcal ?? r.food_calories ?? r.calories ?? r.calories_kcal ?? 0),
    0
  );

  const totalCarbs = allRecords.reduce(
    (sum: number, r: any) => sum + (r.estimated_carb_g ?? r.food_carb ?? r.carbohydrate ?? r.carbs_g ?? 0),
    0
  );

  const totalProteins = allRecords.reduce(
    (sum: number, r: any) => sum + (r.estimated_protein_g ?? r.food_protein ?? r.protein ?? r.protein_g ?? 0),
    0
  );

  const totalFats = allRecords.reduce(
    (sum: number, r: any) => sum + (r.estimated_fat_g ?? r.food_fat ?? r.food_fats ?? r.fat ?? r.fat_g ?? 0),
    0
  );
  // API Fetch for Selected Date
  useEffect(() => {
    fetchRecords(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
      <div className="p-4 max-w-md mx-auto w-full">
        {/* Header */}
        <header className="mb-4 pt-4 flex justify-between items-center">
          <div>
            <span className="block text-sm text-slate-500 mb-1">
              {isMobile ? "모바일" : "PC"}
            </span>
            <h1 className="text-2xl font-bold text-slate-800">기록</h1>
          </div>
          <button
            onClick={handleDeleteDate}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="기록 삭제"
          >
            <Trash2 size={20} />
          </button>
        </header>

        {/* Full Calendar */}
        <section className="mb-6">
          <CalendarFull
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            recordedDays={recordedDays}
            onMonthChange={fetchMonthlyRecords}
          />
        </section>

        {/* Daily Summary (Connected Gradient) */}
        <section className="mb-6 rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="flex w-full bg-gradient-to-r from-white to-indigo-50">
            {/* Calories */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 border-r border-white/50">
              <span className="text-xs font-bold text-slate-600 mb-1 whitespace-nowrap">칼로리</span>
              <div className="flex items-end gap-0.5">
                <span className="font-extrabold text-slate-800 text-lg leading-none">{totalCalories}</span>
                <span className="text-[10px] text-slate-500 font-medium mb-0.5">kcal</span>
              </div>
            </div>
            {/* Carbs */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 border-r border-white/50">
              <span className="text-xs font-bold text-slate-600 mb-1 whitespace-nowrap">탄수화물</span>
              <div className="flex items-end gap-0.5">
                <span className="font-extrabold text-slate-800 text-lg leading-none">{totalCarbs}</span>
                <span className="text-[10px] text-slate-500 font-medium mb-0.5">g</span>
              </div>
            </div>
            {/* Protein */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 border-r border-white/50">
              <span className="text-xs font-bold text-slate-600 mb-1 whitespace-nowrap">단백질</span>
              <div className="flex items-end gap-0.5">
                <span className="font-extrabold text-slate-800 text-lg leading-none">{totalProteins}</span>
                <span className="text-[10px] text-slate-500 font-medium mb-0.5">g</span>
              </div>
            </div>
            {/* Fat */}
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <span className="text-xs font-bold text-slate-600 mb-1 whitespace-nowrap">지방</span>
              <div className="flex items-end gap-0.5">
                <span className="font-extrabold text-slate-800 text-lg leading-none">{totalFats}</span>
                <span className="text-[10px] text-slate-500 font-medium mb-0.5">g</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meal Lists - Vertical Stack */}
        <section className="flex flex-col gap-4 pb-8">
          <RecordMealGroup
            title="아침"
            records={combinedMealData.breakfast}
            onAddClick={() => handleAddMeal("breakfast")}
            onDeleteRecord={handleDeleteRecord}
          />
          <RecordMealGroup
            title="점심"
            records={combinedMealData.lunch}
            onAddClick={() => handleAddMeal("lunch")}
            onDeleteRecord={handleDeleteRecord}
          />
          <RecordMealGroup
            title="저녁"
            records={combinedMealData.dinner}
            onAddClick={() => handleAddMeal("dinner")}
            onDeleteRecord={handleDeleteRecord}
          />
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
