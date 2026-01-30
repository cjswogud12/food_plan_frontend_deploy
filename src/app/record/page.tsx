"use client"

import { useState, useEffect } from 'react';
import { useViewport } from "@/context/ViewportContext"
import FloatingCameraButton from '@/components/FloatingCameraButton'
import CalendarFull from "@/components/MainCalendarFull"
import { FoodAnalysisResult } from "@/types/definitions"
import { getRecord, uploadFoodImage } from "@/api/index"
import RecordMealGroup from "@/components/record/RecordMealGroup"
import { useRef } from "react";

// 식단 데이터를 끼니별로 분류하기 위한 타입
interface DailyMealData {
    breakfast: FoodAnalysisResult[];
    lunch: FoodAnalysisResult[];
    dinner: FoodAnalysisResult[];
    snack: FoodAnalysisResult[];
}

export default function RecordPage() {
    const { isMobile } = useViewport();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mealData, setMealData] = useState<DailyMealData>({
        breakfast: [], lunch: [], dinner: [], snack: []
    });

    // 각 시간 별 음식 저장
    const fileInputRefs = {
        breakfast: useRef<HTMLInputElement>(null),
        lunch: useRef<HTMLInputElement>(null),
        dinner: useRef<HTMLInputElement>(null),
        snack: useRef<HTMLInputElement>(null),
    };

    // + 버튼 클릭 시 파일 선택 창 열기
    const handleAddMeal = (mealType: string) => {
        fileInputRefs[mealType as keyof typeof fileInputRefs].current?.click();
    };

    // 파일 선택 후 업로드 처리
    const handleFileUpload = async (mealType: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('meal_type', mealType);

        const userId = localStorage.getItem("user_id");
        if (userId) formData.append('user_number', userId);

        try {
            const response = await uploadFoodImage(formData);

            if (response.ok) {
                alert(`음식 등록 완료!`);
                // 데이터 새로고침
                const offset = selectedDate.getTimezoneOffset() * 60000;
                const dateString = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];
                const refreshRes = await getRecord(dateString);
                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    setMealData({
                        breakfast: data.breakfast || [],
                        lunch: data.lunch || [],
                        dinner: data.dinner || [],
                        snack: data.snack || []
                    });
                }
            } else {
                alert("업로드 실패");
            }
        } catch (err) {
            console.error(err);
            alert("업로드 중 오류가 발생했습니다.");
        }
    };



    // Calculate Totals
    const allRecords = [...mealData.breakfast, ...mealData.lunch, ...mealData.dinner, ...mealData.snack];
    const totalCalories = allRecords.reduce((sum, r) => sum + (r.estimated_calories_kcal || 0), 0);
    const totalCarbs = allRecords.reduce((sum, r) => sum + (r.estimated_carbs_g || 0), 0);
    const totalProteins = allRecords.reduce((sum, r) => sum + (r.estimated_protein_g || 0), 0);
    const totalFats = allRecords.reduce((sum, r) => sum + (r.estimated_fat_g || 0), 0);

    // API Fetch for Selected Date
    useEffect(() => {
        // 날짜 포맷팅 (YYYY-MM-DD)
        const offset = selectedDate.getTimezoneOffset() * 60000;
        const dateString = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];

        const fetchData = async () => {
            try {
                const response = await getRecord(dateString);

                if (!response.ok) {
                    throw new Error("Failed to fetch records");
                }

                const data = await response.json();

                // 백엔드 응답이 이미 { breakfast: [], ... } 형태인지, 아니면 배열[] 형태인지에 따라 처리가 다름
                // 여기서는 기존 백엔드 로직이 각 끼니(breakfast, lunch, dinner, snack) 키를 주는 형태라고 가정하고,
                // 만약 배열로 온다면 filter로 분류해야 함. 
                // 사용자 요청에 "그거에 맞게 api 호출" 이라고 했으므로, 현재 백엔드 응답 구조(이전 page.tsx 참고)를 유지
                // 이전 코드: data.breakfast || [] ...

                setMealData({
                    breakfast: data.breakfast || [],
                    lunch: data.lunch || [],
                    dinner: data.dinner || [],
                    snack: data.snack || []
                });

            } catch (error) {
                console.error("Fetch Error", error);
                setMealData({ breakfast: [], lunch: [], dinner: [], snack: [] });
            }
        };

        fetchData();
    }, [selectedDate]);

    return (
        <div className="w-full h-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-blue-200 flex flex-col overflow-y-auto">
            <div className="p-4 max-w-md mx-auto w-full pb-24">
                {/* Header */}
                <header className="mb-6 pt-4">
                    <span className="block text-sm text-slate-500 mb-1">{isMobile ? '모바일' : 'PC'}</span>
                    <h1 className="text-2xl font-bold text-slate-800">기록</h1>
                </header>

                {/* Full Calendar */}
                <section className="mb-6">
                    <CalendarFull
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    // recordedDays={recordedDays} 
                    />
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
                            if (file) handleFileUpload(type, file);
                            e.target.value = '';
                        }}
                    />
                ))}

                <FloatingCameraButton />
            </div>
        </div>
    );
}