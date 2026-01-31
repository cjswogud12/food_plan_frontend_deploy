"use client";

import { useState, useEffect } from "react";
import { User as UserIcon } from "lucide-react";
import { Record, User, UserGoal } from "@/types/definitions";
import { getUser, getUserGoal, getInbody, getBodyClassification } from "@/api/index";

interface MypageProfileTargetProps {
    foodrecords?: Record[];
    goal?: string;
}

export default function MypageProfileTarget({ foodrecords = [], goal: propGoal }: MypageProfileTargetProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
    const [goal, setGoal] = useState<string>(propGoal || "-");

    const getGoalFromStage = (stage1: string | number): string => {
        console.log("매핑 전 stage1 값:", stage1); // 디버깅용 로그
        const s = String(stage1).trim();
        if (s === "비만" || s === "1" || s === "DIET") return "다이어트";
        if (s === "표준" || s === "2" || s === "MAINTAIN") return "유지";
        if (s === "마름" || s === "3" || s === "BULKUP") return "증량"; // 혹은 근육증가
        return s; // 매핑 안 되면 원래 값 표시
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
                let userGender: string = "M"; // 기본값

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
                        if (targetUser.gender) userGender = targetUser.gender;
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

                // 체형 분류 가져와서 목표 설정
                const targetNumber = currentUserNumber || Number(localStorage.getItem("user_number"));
                console.log("체형 분석 요청 시도, user_number:", targetNumber);

                if (targetNumber && !isNaN(targetNumber)) {
                    // 최신 인바디 데이터 가져오기 (필수값 확보)
                    let bodyData: any = {
                        // 백엔드가 요구하는 필드명 'gender'로 수정 (값은 M/F)
                        gender: (userGender === 'M' || userGender === '남') ? 'M' : 'F',
                        // 기본값 세팅
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
                                // 체지방량(kg)이 없다면 계산해서라도 넣어야 함: 체중 * (체지방률/100)
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
                            setGoal(getGoalFromStage(classifyData.stage1));
                        } else {
                            const errDetail = await classifyRes.text();
                            console.error("체형 분석 API 응답 실패:", classifyRes.status, errDetail);
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
