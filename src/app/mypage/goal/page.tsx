"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Target, TrendingDown, Minus, TrendingUp } from "lucide-react";

export default function GoalPage() {
    const router = useRouter();

    const handleGoalSelect = (goal: string) => {
        // 선택한 목표를 쿼리 파라미터로 전달하며 다음 단계(활동 수준 선택)로 이동
        router.push(`/mypage/goal/activity?goal=${goal}`);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800">목표 설정</h1>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    {/* 안내 문구 */}
                    <div className="space-y-2 text-center">
                        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
                            <Target size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            어떤 목표를<br />
                            가지고 계신가요?
                        </h2>
                        <p className="text-slate-500 text-sm">
                            목표에 맞는 맞춤형 식단을 추천해드려요.
                        </p>
                    </div>

                    {/* 목표 선택 카드들 */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleGoalSelect("다이어트")}
                            className="bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                                    <TrendingDown size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700">다이어트</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-indigo-600/80">체중 감량이 목표예요</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleGoalSelect("유지")}
                            className="bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-500 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                                    <Minus size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700">유지</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-indigo-600/80">현재 체중을 유지하고 싶어요</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleGoalSelect("증량")}
                            className="bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 group-hover:bg-white group-hover:text-indigo-500 transition-colors">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700">증량</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-indigo-600/80">근육량과 체중을 늘리고 싶어요</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
