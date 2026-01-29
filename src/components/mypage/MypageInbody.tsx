
"use client"
import { useState, useEffect } from "react"
import InbodyUpload from '@/components/InbodyUploadAndHistory'
import { InbodyRecord } from '@/types/definitions'
import { getInbody } from "@/api/index"

interface MypageBodyCompositionProps {
}

export default function MypageBodyComposition({ }: MypageBodyCompositionProps) {
    const [inbodyData, setInbodyData] = useState<InbodyRecord | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInbody();
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();

                // 만약 배열로 들어온다면 가장 최신(마지막 or 첫번째) 데이터를 사용
                if (Array.isArray(data) && data.length > 0) {
                    // 보통 최신순으로 정렬되어 온다고 가정하거나, 가장 마지막 항목이 최신일 수 있음
                    // 여기서는 배열의 첫 번째 요소를 사용하거나 로직에 맞게 선택
                    // (API 응답 구조에 따라 수정 필요, 일단 첫번째 사용)
                    setInbodyData(data[0]);
                } else if (data && !Array.isArray(data)) {
                    setInbodyData(data);
                }
            } catch (error) {
                console.error("Failed to fetch inbody data:", error);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800">체성분</h2>
                <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">체중</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.weight || '-'} <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">신장</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.height || '-'} <span className="text-sm font-normal text-slate-500">cm</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">골격근량</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.skeletal_muscle_mass || '-'}
                            <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">체지방률</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.body_fat_pct || '-'} <span className="text-sm font-normal text-slate-500">%</span>
                        </span>
                    </div>
                </div>
                <InbodyUpload />
            </div>
        </section>
    );
}
