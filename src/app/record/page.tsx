"use client"

import { useState, useEffect } from 'react';
import { useViewport } from "@/context/ViewportContext"
import { Record } from '@/types/record'
import { User } from '@/types/user'
import FloatingCameraButton from '@/components/FloatingCameraButton'
import FoodEatInfo from '@/components/record/record_food_eat_info'
import FoodEatInfoTotal from '@/components/record/record_food_eat_info_total'

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
        <div className="w-full h-full bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-blue-200 flex flex-col">
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
                <FoodEatInfoTotal title={getSectionTitle()} recordData={recordData} />

                {/* 음식 기록 목록 */}
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
                            <span style={{ fontWeight: "bold" }}>{record.food_name}kcal</span>
                            <span>{record.food_calories} </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                            {record.record_created_at}
                        </div>
                    </div>
                ))}
                <FloatingCameraButton />
                <FoodEatInfo title={getSectionTitle2()} /> {/* (오늘,주간,월간)식단 섭취 정보 */}
            </div>
        </div>
    );
}