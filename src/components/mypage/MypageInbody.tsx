
"use client"
import { useState, useEffect } from "react"
import InbodyUpload from '@/components/InbodyUploadAndHistory'
import { InbodyRecord } from '@/types/definitions'
import { getInbody } from "@/api/index"

interface MypageBodyCompositionProps {
    inbodyDataProp?: Partial<InbodyRecord> | null;
}

export default function MypageBodyComposition({ inbodyDataProp }: MypageBodyCompositionProps) {
    const [inbodyData, setInbodyData] = useState<Partial<InbodyRecord> | null>(null);

    useEffect(() => {
        if (inbodyDataProp) {
            setInbodyData(inbodyDataProp);
            return;
        }

        const fetchData = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                const response = await getInbody(userId);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();

                // 만약 배열로 들어온다면 가장 최신(마지막 or 첫번째) 데이터를 사용
                if (Array.isArray(data) && data.length > 0) {
                    setInbodyData(data[0]);
                } else if (data && !Array.isArray(data)) {
                    setInbodyData(data);
                }
            } catch (error) {
                console.error("Failed to fetch inbody data:", error);
            }
        };
        fetchData();
    }, [inbodyDataProp]);

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
