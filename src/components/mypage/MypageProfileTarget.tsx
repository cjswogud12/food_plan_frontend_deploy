"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { Record, User, UserGoal } from "@/types/definitions";
import { getUser, getUserGoal } from "@/api/index";
import { getBodyClassification } from "@/api/index";

interface MypageProfileTargetProps {
    foodrecords?: Record[];
    goal?: string;
}

export default function MypageProfileTarget({ foodrecords = [], goal: propGoal }: MypageProfileTargetProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
    const [goal, setGoal] = useState<string>(propGoal || "-");

    const getGoalFromStage = (stage1: string): string => {
        if (stage1 === "비만") return "다이어트";
        if (stage1 === "마름") return "증량";
        if (stage1 === "표준") return "유지";
        return "-";
    };

    // propGoal이 변경되면 goal state 업데이트
    useEffect(() => {
        if (propGoal) {
            setGoal(propGoal);
        }
    }, [propGoal]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 유저 정보 가져오기 (가장 먼저 수행하여 최신 user_number 확보)
                const userId = localStorage.getItem("user_id");
                const userRes = await getUser(userId);
                let currentUserNumber: number | null = null;

                if (userRes.ok) {
                    const userData = await userRes.json();
                    let targetUser: User | null = null;

                    if (Array.isArray(userData) && userData.length > 0) {
                        targetUser = userData[0];
                    } else if (userData && !Array.isArray(userData)) {
                        targetUser = userData;
                    }

                    if (targetUser) {
                        setUser(targetUser);
                        // 최신 user_number 확보 및 로컬스토리지 갱신
                        if (targetUser.user_number) {
                            currentUserNumber = targetUser.user_number;
                            localStorage.setItem("user_number", String(currentUserNumber));
                        }
                    }
                }

                // 유저 목표 가져오기
                const goalRes = await getUserGoal();
                if (goalRes.ok) {
                    const goalData = await goalRes.json();
                    if (Array.isArray(goalData) && goalData.length > 0) setUserGoal(goalData[0]);
                    else if (goalData && !Array.isArray(goalData)) setUserGoal(goalData);
                }

                // 체형 분류 가져와서 목표 설정 (확보한 최신 user_number 사용)
                // 만약 API에서 못 가져왔다면 기존 로컬스토리지 값이라도 시도
                const targetNumber = currentUserNumber || Number(localStorage.getItem("user_number"));
                console.log("체형 분석 요청 시도, user_number:", targetNumber);

                if (targetNumber && !isNaN(targetNumber)) {
                    try {
                        const classifyRes = await getBodyClassification(targetNumber);
                        if (classifyRes.ok) {
                            const classifyData = await classifyRes.json();
                            setGoal(getGoalFromStage(classifyData.stage1));
                        } else {
                            console.error("체형 분석 API 응답 실패:", classifyRes.status);
                        }
                    } catch (error) {
                        console.error("체형 분석 API 호출 중 에러 발생:", error);
                    }
                } else {
                    console.warn("유효한 user_number가 없어 체형 분석을 건너뜁니다.");
                }

            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchData();
    }, []);

    // 현재 섭취 칼로리 계산
    const currentCal = foodrecords.reduce((acc, cur) => acc + (cur.food_calories || 0), 0);

    // 목표 칼로리 (UserGoal의 target_calorie 사용)
    const goalCal = userGoal?.target_calorie || 0;

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

                    {/* Right: Goal Display */}
                    <span className="bg-purple-500 text-white rounded-full text-xs px-3 py-2">
                        {goal}
                    </span>
                </div>
            </div>
        </section>
    );
}
