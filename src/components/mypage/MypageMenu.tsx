"use client";

import { useRouter } from "next/navigation";
import { Target, MapPin } from "lucide-react";
import { useUserStore, useDietStore } from "@/store";

interface MypageMenuProps {
    onGoalChange?: (goal: string) => void;
}

export default function MypageMenu({ onGoalChange }: MypageMenuProps) {
    const router = useRouter();
    const { user, userGoal } = useUserStore();
    const { resetDiet } = useDietStore();

    return (
        <>
            <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50">
                <div className="card-container w-full">
                    <div className="flex justify-center gap-16 text-center">
                        <button
                            onClick={() => router.push("/mypage/address")}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-500 rounded-full group-hover:from-indigo-100 group-hover:to-purple-100 transition-all shadow-sm">
                                <MapPin size={28} />
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">주소 설정</span>
                        </button>
                        <button
                            onClick={() => router.push("/mypage/goal")}
                            className="flex flex-col items-center gap-3 group"
                        >
                            <div className="p-4 bg-indigo-50 text-indigo-400 rounded-full group-hover:bg-indigo-100 transition-colors shadow-sm">
                                <Target size={28} />
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">목표 설정</span>
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
