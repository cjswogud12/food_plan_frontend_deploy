"use client";

import { Record } from "@/types/definitions";

interface RecordMealGroupProps {
    title: string;
    records: Record[];
}

export default function RecordMealGroup({ title, records }: RecordMealGroupProps) {
    const mealCal = records.reduce((sum, r) => sum + (r.food_calories || 0), 0);

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col h-full min-h-[160px]">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{title}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{mealCal} kcal</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {records.length > 0 ? (
                    <div className="space-y-2">
                        {records.map(record => (
                            <div key={record.record_id} className="text-sm">
                                <div className="font-medium text-slate-700 truncate">{record.food_name}</div>
                                <div className="text-xs text-purple-600">{record.food_calories} kcal</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        기록 없음
                    </div>
                )}
            </div>
        </div>
    );
}