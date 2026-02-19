"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Activity } from "lucide-react";
import { useUserStore, useDietStore } from "@/store";
import { updateUserGoal, updateUserActivity, getMypage } from "@/api/index";

const ACTIVITY_LEVELS = [
    {
        key: "sedentary",
        label: "거의 운동 안 함",
        factor: 1.2,
        description: "주로 앉아서 생활하며 운동을 거의 하지 않음",
    },
    {
        key: "light",
        label: "가벼운 활동",
        factor: 1.375,
        description: "주 1~3회 가벼운 운동",
    },
    {
        key: "moderate",
        label: "보통 활동",
        factor: 1.55,
        description: "주 3~5회 적당한 강도의 운동",
    },
    {
        key: "active",
        label: "매우 활동적",
        factor: 1.725,
        description: "주 6~7회 강도 높은 운동",
    },
    {
        key: "very_active",
        label: "선수급 활동",
        factor: 1.9,
        description: "하루에 2회 이상 고강도 훈련, 육체노동직",
    },
];

function GoalActivityContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const goalType = searchParams.get("goal");

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bodyData, setBodyData] = useState<any>(null); // BMR, 키, 몸무게 등

    const { user, userGoal } = useUserStore();
    const { resetDiet } = useDietStore();

    // 사용자 신체 정보 가져오기 (BMR 등)
    useEffect(() => {
        const fetchBodyData = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                const res = await getMypage(userId); // getMypage에서 body 정보 리턴
                if (res.ok) {
                    const data = await res.json();
                    if (data.body) {
                        setBodyData(data.body);
                    }
                }
            } catch (error) {
                console.error("신체 정보 로드 실패:", error);
            }
        };
        fetchBodyData();
    }, []);


    const calculateTargetCalorie = (bmr: number, factor: number, goal: string): number => {
        const tdee = bmr * factor;
        if (goal === "다이어트") return Math.round(tdee * 0.85);
        if (goal === "증량") return Math.round(tdee * 1.15);
        return Math.round(tdee); // 유지
    };

    // BMR이 없을 경우 Mifflin-St Jeor 공식으로 추정
    const estimateBMR = (weight: number, height: number, age: number, gender: string): number => {
        // gender: 'M' or 'F' (assuming backend uses 'M'/'F' or '남자'/'여자')
        const isMale = gender === 'M' || gender === '남자' || gender === 'male';
        // Mifflin-St Jeor Equation
        let bmr = (10 * weight) + (6.25 * height) + (5 * age);
        bmr += isMale ? 5 : -161;
        return bmr;
    }


    const handleConfirm = async () => {
        if (selectedIndex === null || !goalType) return;

        setIsSubmitting(true);
        try {
            const selectedLevel = ACTIVITY_LEVELS[selectedIndex];
            const userNumber = user?.user_number;

            // 기존 BMR 계산 로직은 유지 (로그 및 확인용)
            // 실제 업데이트는 API가 처리

            if (userNumber) {

                // 1. BMR 확보 (기존 데이터 or 추정)
                let bmr = bodyData?.bmr;
                if (!bmr && bodyData?.weight && bodyData?.height) {
                    // 나이/성별 정보가 없으면 기본값(30세/남성)으로 추정하여 계산
                    const age = 30;
                    const gender = 'M';
                    bmr = estimateBMR(bodyData.weight, bodyData.height, age, gender);
                }

                // 2. 목표 칼로리 계산
                let targetCalorie = 2000; // 기본값
                if (bmr) {
                    targetCalorie = calculateTargetCalorie(bmr, selectedLevel.factor, goalType);
                }

                // 3. API 호출 (활동수준 & 목표 동시 업데이트)
                // updateUserGoal: 목표(다이어트/유지/증량) 및 목표 칼로리 저장
                // updateUserActivity: 활동 수준(sedentary 등) 저장
                const [resActivity, resGoal] = await Promise.all([
                    updateUserActivity(userNumber, selectedLevel.key),
                    updateUserGoal(userNumber, goalType, targetCalorie)
                ]);

                if (resActivity.ok && resGoal.ok) {
                    resetDiet(); // 식단 리셋
                    alert(`활동 수준과 목표가 저장되었습니다.`);
                    router.push("/"); // 메인으로 이동
                } else {
                    console.error("업데이트 실패", { activity: resActivity.status, goal: resGoal.status });
                    alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
                }
            } else {
                console.error("user_number가 없습니다.");
                alert("로그인 정보가 없습니다.");
            }

        } catch (error) {
            console.error("활동 수준 업데이트 실패:", error);
            alert("처리 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
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
                <h1 className="text-lg font-bold text-slate-800">활동 수준 선택</h1>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
                <div className="w-full max-w-sm mx-auto space-y-6">
                    {/* 안내 문구 */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
                            <Activity size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            가장 가까운<br />
                            활동 수준을 선택해주세요
                        </h2>
                        <p className="text-slate-500 text-sm">
                            선택하신 <span className="text-indigo-600 font-bold">{goalType}</span> 목표와 활동량에 맞춰<br />
                            식단을 추천해드릴게요.
                        </p>
                    </div>

                    {/* 선택지 카드 */}
                    <div className="space-y-3 pb-8">
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
            <div className="p-6 pb-10 bg-white border-t border-slate-100">
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
                            <span>저장 중...</span>
                        </>
                    ) : (
                        <>
                            <span>설정 완료</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function GoalActivityPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GoalActivityContent />
        </Suspense>
    );
}
