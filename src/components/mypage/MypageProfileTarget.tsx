"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { Record, User } from "@/types/definitions";
import { getUser, getUserGoal, getInbody, getBodyClassification } from "@/api/index";
import { useUserStore } from "@/store";

interface MypageProfileTargetProps {
    foodrecords?: Record[];
    goal?: string | null;
}

export default function MypageProfileTarget({ foodrecords = [], goal: propGoal }: MypageProfileTargetProps) {

    // Zustand Store
    const { user, setUser, userGoal, setUserGoal } = useUserStore();
    // Local State
    const [goal, setGoal] = useState<string>(propGoal || "-");
    const [suggestedGoal, setSuggestedGoal] = useState<string>("-");

    // propGoal이 변경되면 로컬 state도 업데이트
    useEffect(() => {
        if (propGoal !== undefined) {
            setGoal(propGoal || "-");
        }
    }, [propGoal]);

    const getGoalFromStage = (stage1: string | number | undefined | null): string => {
        if (!stage1) return "-";
        const s = String(stage1).trim().toUpperCase();

        if (["비만", "1", "DIET", "다이어트", "감량"].includes(s)) return "다이어트";
        if (["표준", "2", "MAINTAIN", "유지"].includes(s)) return "유지";
        if (["마름", "3", "BULKUP", "BULK", "증량", "근육증가", "벌크", "벌크업"].includes(s)) return "증량";
        return String(stage1);
    };

    // prop으로 받은 goal이 유효하면 그것을 쓰고, 아니면 추천 목표를 사용
    const rawGoal = (propGoal && propGoal !== "-") ? propGoal : suggestedGoal;
    const displayGoal = getGoalFromStage(rawGoal);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 유저 정보 가져오기 
                const userId = localStorage.getItem("user_id");
                const userRes = await getUser(userId);
                let currentUserNumber: number | null = null;
                let userGender: string = "M";

                if (userRes.ok) {
                    const userData = await userRes.json();
                    let targetUser: User | null = null;
                    if (Array.isArray(userData) && userData.length > 0) targetUser = userData[0];
                    else if (userData && !Array.isArray(userData)) targetUser = userData;

                    if (targetUser) {
                        setUser(targetUser);
                        if (targetUser.gender) userGender = targetUser.gender;
                        if (targetUser.user_number) {
                            currentUserNumber = targetUser.user_number;
                            localStorage.setItem("user_number", String(currentUserNumber));
                        }
                    }
                }

                // 유저 목표 가져오기 (칼로리 계산용)
                const goalRes = await getUserGoal();
                if (goalRes.ok) {
                    const goalData = await goalRes.json();
                    if (Array.isArray(goalData) && goalData.length > 0) setUserGoal(goalData[0]);
                    else if (goalData && !Array.isArray(goalData)) setUserGoal(goalData);
                    else setUserGoal(null); // 데이터가 비어있으면 null
                } else if (goalRes.status === 404) {
                    // ✅ 404일 때 명시적으로 null 설정
                    console.log("🎯 [PROFILE] Goal not found (404), clearing userGoal");
                    setUserGoal(null);
                } else {
                    // 다른 에러의 경우도 null로 설정
                    console.warn("🎯 [PROFILE] Goal fetch failed:", goalRes.status);
                    setUserGoal(null);
                }

                // 체형 분류 가져와서 목표 설정 (fallback용)
                const targetNumber = currentUserNumber || Number(localStorage.getItem("user_number"));

                if (targetNumber && !isNaN(targetNumber)) {
                    // 최신 인바디 데이터 가져오기 (필수값 확보)
                    let bodyData: any = {
                        gender: (userGender === 'M' || userGender === '남') ? 'M' : 'F',
                        height_cm: 170,
                        weight_kg: 70,
                        body_fat_kg: 10,
                        body_fat_pct: 15,
                        skeletal_muscle_kg: 30
                    };

                    try {
                        const inbodyRes = await getInbody(userId);
                        if (inbodyRes.ok) {
                            const inbodyJson = await inbodyRes.json();
                            const latestInfo = Array.isArray(inbodyJson) ? inbodyJson[0] : inbodyJson;
                            if (latestInfo) {
                                bodyData.height_cm = latestInfo.height || 170;
                                bodyData.weight_kg = latestInfo.weight || 70;
                                bodyData.skeletal_muscle_kg = latestInfo.skeletal_muscle_mass || 30;
                                bodyData.body_fat_pct = latestInfo.body_fat_pct || 15;
                                if (latestInfo.weight && latestInfo.body_fat_pct) {
                                    bodyData.body_fat_kg = (latestInfo.weight * (latestInfo.body_fat_pct / 100));
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("인바디 데이터 조회 실패, 기본값 사용");
                    }

                    try {
                        const classifyRes = await getBodyClassification(targetNumber, bodyData);
                        if (classifyRes.ok) {
                            const classifyData = await classifyRes.json();
                            setSuggestedGoal(getGoalFromStage(classifyData.stage1));
                        } else {
                            const errDetail = await classifyRes.text();
                            console.error("체형 분석 API 응답 실패:", classifyRes.status, errDetail);
                        }
                    } catch (error) {
                        console.error("체형 분석 중 에러:", error);
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
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50">
            <div className="card-container w-full">
                <div className="flex items-center justify-between">
                    {/* Left: User Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                            <UserIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {user?.username || "Guest"}
                        </h2>
                    </div>
                    {/* Right: Goal Display */}
                    <div className="flex flex-col items-center justify-center bg-white/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/60 shadow-sm relative overflow-hidden group">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent opacity-50 z-0"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 font-extrabold tracking-[0.2em] mb-0.5">나의 목표</span>
                            <span className="text-xl font-black text-indigo-900 drop-shadow-sm">
                                {displayGoal}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

