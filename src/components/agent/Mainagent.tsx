"use client";

import { RestaurantMenuItem } from "@/types/definitions";
import { Square, CheckSquare, Utensils, ChevronRight } from "lucide-react";

interface AgentFoodItemProps {
    item: RestaurantMenuItem;
    isChecked: boolean;
    onCheck: () => void;
    onClick?: () => void;
}

export default function AgentFoodItem({ item, isChecked, onCheck, onClick }: AgentFoodItemProps) {
    return (
        <div
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClick}
        >
            {/* 체크박스 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onCheck();
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isChecked
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                    }`}
            >
                {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>

            {/* 음식 이미지 자리 (백엔드에 이미지 필드 없으므로 플레이스홀더) */}
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Utensils size={20} className="text-indigo-300" />
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1 min-w-0">
                <p
                    className={`font-bold text-sm truncate ${item.place_url ? 'text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer' : 'text-slate-800'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (item.place_url) {
                            window.open(item.place_url, "_blank");
                        }
                    }}
                >
                    {item.menu_name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                    {item.restaurant_name} · {item.distance_m}m
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-500">
                        {item.calories_kcal} kcal
                    </span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-500">
                        {item.price.toLocaleString()}원
                    </span>
                </div>
            </div>

            {/* 화살표 */}
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
        </div>
    );
}
