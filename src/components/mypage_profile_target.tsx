"use client";

import { User } from "lucide-react";
import { Record } from "@/types/definitions";

interface MypageProfileTargetProps {
    foodrecords?: Record[];
}

export default function MypageProfileTarget({ foodrecords = [] }: MypageProfileTargetProps) {  // default value for safety
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container w-full">
                <div className="flex items-center gap-4">
                    {/* Left: Profile Icon */}
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                        <User size={24} />
                    </div>

                    {/* Center: Info & Progress */}
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <h2 className="text-lg font-bold text-slate-800">UserName</h2>
                            <span className="text-sm font-bold text-purple-600">100%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                    </div>

                    {/* Right: Button */}
                    <button className="px-3 py-1.5 text-xs font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap">
                        목표 수정
                    </button>
                </div>

                {/* API 연동 확인 (목표 칼로리) */}
                {foodrecords.length > 0 && (
                    <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "16px" }}>
                        목표: {foodrecords[0].goal_calories} kcal
                    </p>
                )}
            </div>
        </section>
    );
}
