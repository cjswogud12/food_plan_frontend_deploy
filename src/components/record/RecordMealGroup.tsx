"use client";

import { Plus } from "lucide-react";
import { FoodAnalysisResult } from "@/types/definitions";

interface RecordMealGroupProps {
    title: string;
    records: FoodAnalysisResult[];
    onAddClick?: () => void;
}

export default function RecordMealGroup({ title, records, onAddClick }: RecordMealGroupProps) {
    const mealCal = records.reduce((sum, r) => sum + (r.estimated_calories_kcal || 0), 0);

    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col h-full min-h-[160px]">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{title}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{mealCal} kcal</span>
            </div>
            <button
                onClick={onAddClick}
                className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
            >
                <Plus size={14} />
            </button>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {records.length > 0 ? (
                    <div className="space-y-2">
                        {records.map(record => (
                            <div key={record.far_id} className="text-sm">
                                <div className="font-medium text-slate-700 truncate">{record.predicted_food_name}</div>
                                <div className="text-xs text-purple-600">{record.estimated_calories_kcal} kcal</div>
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