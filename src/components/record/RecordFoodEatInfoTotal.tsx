"use client";

import { Record } from '@/types/definitions';

interface FoodEatInfoTotalProps {
    title: string;
    recordData?: Record | null;
}

export default function FoodEatInfoTotal({ title, recordData }: FoodEatInfoTotalProps) {
    return (
        <section className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <span className="text-xs text-purple-500 font-medium bg-purple-50 px-2 py-1 rounded-md">
                    {/*recordData?.date || '-'*/} {/*목표치 설정 변경할 데이터 (임시)*/}
                </span>

                <div className="flex flex-col gap-3 mt-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">섭취 칼로리</span>
                            <span className="text-sm font-bold text-slate-800">
                                {/*recordData?.calories ? `${recordData.calories.toLocaleString()} kcal / 3000` : '-/-'*/} kcal {/*목표치 설정 변경할 데이터 (임시)*/}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                                className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ /*width: recordData?.calories ? `${Math.min((recordData.calories / 3000) * 100, 100)}%` : '0%' */ }}// 3000은 목표치 설정 변경할 데이터 (임시)
                            ></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                            <div className="font-bold text-purple-600 mb-1">총 탄수화물</div>
                            <div>{/*recordData?.carbs || '-'*/}g</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                            <div className="font-bold text-purple-600 mb-1">총 단백질</div>
                            <div>{/*recordData?.protein || '-'*/}g</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                            <div className="font-bold text-purple-600 mb-1">총 지방</div>
                            <div>{/*recordData?.fat || '-'*/}g</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
