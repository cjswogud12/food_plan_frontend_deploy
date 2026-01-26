"use client"

import React, { useState, useEffect } from 'react';
import { useViewport } from "@/context/ViewportContext"

// 삭제할 데이터 (임시)
interface RecordStats {
    date: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    weight: number;
    muscle: number;
    fatRate: number;
}
// 삭제할 데이터 (임시)
interface Food {
 food_id: number;
    food_name: string;
    food_calories: number;
    food_proteins: number;
    food_carbs: number;
    food_fats: number;
    food_image?: string;
}
// 삭제할 데이터 (임시)
interface MockDataMap {
    [key: string]: RecordStats;
}

export default function Home() {
    const { isMobile } = useViewport();
    const [activeTab, setActiveTab] = useState('day');
    const [recordData, setRecordData] = useState<RecordStats | null>(null);

    // 삭제할 더미데이터 (임시)
    const mockData: MockDataMap = {
        day: {
            date: '2030.01.01',
            calories: 2000,
            carbs: 150,
            protein: 80,
            fat: 45,
            weight: 65.5,
            muscle: 30.2,
            fatRate: 18.5
        },
        week: {
            date: '1월 3주차',
            calories: 1600,
            carbs: 180,
            protein: 85,
            fat: 50,
            weight: 65.2,
            muscle: 30.4,
            fatRate: 18.2
        },
        month: {
            date: '2030년 1월',
            calories: 1550,
            carbs: 170,
            protein: 82,
            fat: 48,
            weight: 66.0,
            muscle: 30.0,
            fatRate: 19.0
        }
    };

    useEffect(() => {
        setRecordData(mockData[activeTab]);
    }, [activeTab]);

    const getSectionTitle = () => {
        if (activeTab === 'week') return '주간 기록';
        if (activeTab === 'month') return '월간 기록';
        return '오늘의 기록';
    };
    const getSectionTitle2 = () => {
        if (activeTab === 'week') return '주간 섭취 음식';
        if (activeTab === 'month') return '월간 섭취 음식';
        return '오늘 섭취 음식';
    };

    return (
        <div className="w-full h-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-blue-200 relative flex flex-col">
            {/* 기록 헤더 */}
            <div className="pt-8 px-6 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">기록</h1>

                {/* 하루, 월간, 주간 토글 버튼 */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['day', 'week', 'month'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'day' ? '하루' : tab === 'week' ? '주간' : '월간'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex flex-col p-6 gap-4 pb-24 h-full overflow-hidden">

                
                <section className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="card-container">
                        <h2 className="text-lg font-bold text-slate-800">{getSectionTitle()}</h2>
                        <span className="text-xs text-purple-500 font-medium bg-purple-50 px-2 py-1 rounded-md">
                            {recordData?.date || '-'} {/*목표치 설정 변경할 데이터 (임시)*/}
                        </span>

                        <div className="flex flex-col gap-3 mt-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">섭취 칼로리</span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {recordData?.calories ? `${recordData.calories.toLocaleString()} kcal / 3000` : '-/-'} kcal {/*목표치 설정 변경할 데이터 (임시)*/}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: recordData?.calories ? `${Math.min((recordData.calories / 3000) * 100, 100)}%` : '0%' }}// 3000은 목표치 설정 변경할 데이터 (임시)
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">총 탄수화물</div>
                                    <div>{recordData?.carbs || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">총 단백질</div>
                                    <div>{recordData?.protein || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">총 지방</div>
                                    <div>{recordData?.fat || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: (오늘,주간,월간)식단 섭취 정보*/}
                <section className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="card-container">
                        <h2 className="text-lg font-bold text-slate-800">{getSectionTitle2()}</h2>
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-medium text-slate-600">음식1이름</span> {/*food_name*/}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">칼로리</div>
                                    <div>{recordData?.calories || '-'}kcal</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                                
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">탄수화물</div>
                                    <div>{recordData?.carbs || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">단백질</div>
                                    <div>{recordData?.protein || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">지방</div>
                                    <div>{recordData?.fat || '-'}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                                </div>
                               </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}