"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { Record, User, UserGoal } from "@/types/definitions";
import { getUser, getUserGoal } from "@/api/user";


interface MypageProfileTargetProps {
    foodrecords?: Record[];
}

export default function MypageProfileTarget({ foodrecords = [] }: MypageProfileTargetProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userGoal, setUserGoal] = useState<UserGoal | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 유저 정보 가져오기
                const userRes = await getUser();
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (Array.isArray(userData) && userData.length > 0) setUser(userData[0]);
                    else if (userData && !Array.isArray(userData)) setUser(userData);
                }

                // 유저 목표 가져오기
                const goalRes = await getUserGoal();
                if (goalRes.ok) {
                    const goalData = await goalRes.json();
                    if (Array.isArray(goalData) && goalData.length > 0) setUserGoal(goalData[0]);
                    else if (goalData && !Array.isArray(goalData)) setUserGoal(goalData);
                }

            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchData();
    }, []);

    // 현재 섭취 칼로리 계산
    const currentCal = foodrecords.reduce((acc, cur) => acc + (cur.food_calories || 0), 0);

    // 목표 칼로리 (UserGoal의 target_calory 사용)
    const goalCal = userGoal?.target_calory || 0;

    // 진행률 계산
    const percent = goalCal > 0 ? Math.min(100, Math.round((currentCal / goalCal) * 100)) : 0;

    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container w-full">
                <div className="flex items-center gap-4">
                    {/* Left: Profile Icon */}
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                        <UserIcon size={24} />
                    </div>

                    {/* Center: Info & Progress */}
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <h2 className="text-lg font-bold text-slate-800">
                                {user?.username || "Guest"}
                            </h2>
                            <span className="text-sm font-bold text-purple-600">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                                className="bg-purple-500 h-2.5 rounded-full"
                                style={{ width: `${percent}%`, transition: "width 0.5s ease-in-out" }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right mt-1">
                            목표: {goalCal} kcal
                        </div>
                    </div>

                    {/* Right: Button */}
                    <button className="p-2 text-slate-400 hover:text-slate-600 bg-purple-500 text-white rounded-full text-xs px-3">
                        목표 변경
                    </button>
                </div>
            </div>
        </section>
    );
}
