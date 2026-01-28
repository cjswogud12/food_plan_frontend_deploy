"use client";

interface MypageFoodChartProps {
    // foodType?: string;
    // achievementRate?: number;
    // foodAmount?: number;
    // calories?: number;
}

export default function MypageFoodChart({ }: MypageFoodChartProps) {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container w-full">
                <h2 className="text-lg font-bold text-slate-800 mb-4">식단 통계</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">식단 유형</span>
                        <span className="text-lg font-bold text-purple-600">다이어트</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">달성률</span>
                        <span className="text-lg font-bold text-purple-600">85%</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">음식 양</span>
                        <span className="text-lg font-bold text-purple-600">450g</span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">칼로리</span>
                        <span className="text-lg font-bold text-purple-600">1,200kcal</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
