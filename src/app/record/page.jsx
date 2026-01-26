"use client"

import React, { useState, useEffect } from 'react';
import { useViewport } from "@/context/ViewportContext"


export default function Home() {
    const { isMobile } = useViewport();
    const [activeTab, setActiveTab] = useState('day');
    const [recordData, setRecordData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/record');
                if (response.ok) {
                    const data = await response.json();
                    setRecordData(data);
                    console.log("API Response:", data);
                } else {
                    console.error("API response not ok");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full h-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-blue-200 relative flex flex-col">
            {/* Header & Tabs */}
            <div className="pt-8 px-6 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">기록</h1>

                {/* Toggle Buttons */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {['day', 'week', 'month'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab
                                ? 'bg-white text-blue-600 shadow-sm'
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

                {/* Section 1: Today's Record */}
                <section className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="card-container">
                        <h2 className="text-lg font-bold text-slate-800">오늘의 기록</h2>
                        <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-md">
                            {recordData?.date || '2030.01.01'}
                        </span>

                        <div className="flex flex-col gap-3">
                            {/* Mock Content */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">섭취 칼로리</span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {recordData?.calories ? `${recordData.calories} / 2,000` : '-/-'} kcal
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: recordData?.calories ? `${Math.min((recordData.calories / 2000) * 100, 100)}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                    <div className="font-bold text-orange-600 mb-1">탄수화물</div>
                                    <div>{recordData?.carbs || '-'}g</div>
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">단백질</div>
                                    <div>{recordData?.protein || '-'}g</div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                    <div className="font-bold text-yellow-600 mb-1">지방</div>
                                    <div>{recordData?.fat || '-'}g</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Body Composition */}
                <section className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="card-container">
                        <h2 className="text-lg font-bold text-slate-800">체성분</h2>
                        <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center">
                                <span className="text-sm text-green-700 mb-1 font-medium">체중</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {recordData?.weight || '0'} <span className="text-sm font-normal text-slate-500">kg</span>
                                </span>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                                <span className="text-sm text-blue-700 mb-1 font-medium">골격근량</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {recordData?.muscle || '0'} <span className="text-sm font-normal text-slate-500">kg</span>
                                </span>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex flex-col items-center justify-center col-span-2">
                                <span className="text-sm text-pink-700 mb-1 font-medium">체지방률</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {recordData?.fatRate || '0'} <span className="text-sm font-normal text-slate-500">%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
