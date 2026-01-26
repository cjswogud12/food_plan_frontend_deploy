"use client"

import React, { useState, useEffect } from 'react';
import { useViewport } from "@/context/ViewportContext"
import { Record } from "@/types/record"
import { User } from "@/types/user"

export default function Home() {
    const { isMobile } = useViewport();
    const [activeTab, setActiveTab] = useState('day');
    const [recordData, setRecordData] = useState<Record | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [foodrecords, setFoodRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Record 데이터 가져오기
                const recordRes = await fetch('http://localhost:8000/api/record');
                if (recordRes.ok) {
                    const data = await recordRes.json();
                    setRecordData(data);
                }

                // User 데이터 가져오기
                const userRes = await fetch('http://localhost:8000/api/user');
                if (userRes.ok) {
                    const data = await userRes.json();
                    setUserData(data);
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
                            {/*recordData?.date || '2030.01.01'*/}
                        </span>

                        <div className="flex flex-col gap-3">
                            {/* Mock Content */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-600">섭취 칼로리</span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {recordData?.food_calories ? `${recordData.food_calories} / 2,000` : '-/-'} kcal
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: recordData?.food_calories ? `${Math.min((recordData.food_calories / 2000) * 100, 100)}%` : '0%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                    <div className="font-bold text-orange-600 mb-1">탄수화물</div>
                                    <div>{recordData?.food_carbs || '-'}g</div>
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                    <div className="font-bold text-purple-600 mb-1">단백질</div>
                                    <div>{recordData?.food_protein || '-'}g</div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                    <div className="font-bold text-yellow-600 mb-1">지방</div>
                                    <div>{recordData?.food_fats || '-'}g</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*음식 기록 목록*/}
                {!loading && !error && foodrecords.map((record) => (
                    <div key={record.record_id}
                        style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "8px",
                            backgroundColor: "#f9f9f9"
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: "bold" }}>{record.food_name}</span>
                            <span>{record.food_calories} kcal</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                            {record.record_created_at}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
