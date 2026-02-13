"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const ACTIVITY_LEVELS = [
    {
        label: "거의 운동 안 함",
        factor: 1.2,
        description: "주로 앉아서 생활하며 운동을 거의 하지 않음",
    },
    {
        label: "가벼운 활동",
        factor: 1.375,
        description: "주 1~3회 가벼운 운동",
    },
    {
        label: "보통 활동",
        factor: 1.55,
        description: "주 3~5회 적당한 강도의 운동",
    },
    {
        label: "매우 활동적",
        factor: 1.725,
        description: "주 6~7회 강도 높은 운동",
    },
    {
        label: "선수급 활동",
        factor: 1.9,
        description: "하루에 2회 이상 고강도 훈련, 육체노동직",
    },
];

export default function SurveyPage() {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (selectedIndex === null) return;

        setIsSubmitting(true);
        try {
            const selectedFactor = ACTIVITY_LEVELS[selectedIndex].factor;

            // TODO: 백엔드 엔드포인트 연결
            // await postJson("/api/user/activity-level", { activity_factor: selectedFactor });
            console.log("선택된 활동 계수:", selectedFactor);

            router.push("/onboarding/address");
        } catch (error) {
            console.error("설문 제출 실패:", error);
            alert("제출에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-center">
                <h1 className="text-lg font-bold text-slate-800">활동 수준 선택</h1>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
                <div className="w-full max-w-sm mx-auto space-y-6">
                    {/* 안내 문구 */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">
                            <span className="text-indigo-600">TDEE 계산</span>을 위해
                            <br />
                            활동 수준을 선택해주세요
                        </h2>
                        <p className="text-slate-500 text-sm">
                            정확한 칼로리 목표 설정에 반영됩니다.
                        </p>
                    </div>

                    {/* 선택지 카드 */}
                    <div className="space-y-3">
                        {ACTIVITY_LEVELS.map((level, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`
                                    w-full text-left p-4 rounded-2xl border-2 transition-all duration-200
                                    ${selectedIndex === index
                                        ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold text-base ${selectedIndex === index ? "text-indigo-700" : "text-slate-700"}`}>
                                                {level.label}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selectedIndex === index
                                                ? "bg-indigo-200 text-indigo-700"
                                                : "bg-slate-100 text-slate-500"
                                                }`}>
                                                {level.factor}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${selectedIndex === index ? "text-indigo-600" : "text-slate-400"}`}>
                                            {level.description}
                                        </p>
                                    </div>
                                    {/* 라디오 인디케이터 */}
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 transition-all
                                        ${selectedIndex === index
                                            ? "border-indigo-500 bg-indigo-500"
                                            : "border-slate-300"
                                        }
                                    `}>
                                        {selectedIndex === index && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* 하단 확인 버튼 */}
            <div className="p-6 pb-10 bg-white">
                <button
                    onClick={handleConfirm}
                    disabled={selectedIndex === null || isSubmitting}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200/50
                        ${selectedIndex === null
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isSubmitting
                                ? "bg-indigo-400 text-white cursor-wait"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                        }
                    `}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>처리 중...</span>
                        </>
                    ) : (
                        <>
                            <span>확인</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
