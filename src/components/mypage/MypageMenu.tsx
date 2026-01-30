"use client";

import { useState } from "react";
import { User, Target, Bell, Link } from "lucide-react";
import { updateUserGoal } from "@/api/index";

interface MypageMenuProps {
    onGoalChange?: (goal: string) => void;
}

export default function MypageMenu({ onGoalChange }: MypageMenuProps) {
    const [showGoalModal, setShowGoalModal] = useState(false);

    const handleSelectGoal = async (selectedGoal: string) => {
        try {
            const res = await updateUserGoal(selectedGoal);
            if (res.ok) {
                onGoalChange?.(selectedGoal);
            }
        } catch (error) {
            console.error("목표 업데이트 실패:", error);
        }
        setShowGoalModal(false);
    };

    return (
        <>
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="card-container w-full">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                <User size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">내 정보</span>
                        </button>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                <Target size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">목표 설정</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                <Bell size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">알림 설정</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                <Link size={24} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">계정 연동</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* 목표 선택 모달 */}
            {showGoalModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-72">
                        <h3 className="text-lg font-bold mb-4 text-center">목표 설정</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleSelectGoal("다이어트")}
                                className="py-3 bg-purple-100 rounded-xl text-purple-700 font-medium hover:bg-purple-200"
                            >
                                다이어트
                            </button>
                            <button
                                onClick={() => handleSelectGoal("유지")}
                                className="py-3 bg-purple-100 rounded-xl text-purple-700 font-medium hover:bg-purple-200"
                            >
                                유지
                            </button>
                            <button
                                onClick={() => handleSelectGoal("증량")}
                                className="py-3 bg-purple-100 rounded-xl text-purple-700 font-medium hover:bg-purple-200"
                            >
                                증량
                            </button>
                        </div>
                        <button
                            onClick={() => setShowGoalModal(false)}
                            className="mt-4 w-full py-2 text-gray-500 text-sm"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
