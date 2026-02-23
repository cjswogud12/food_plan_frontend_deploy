"use client";

import { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";
import { InbodyRecord } from "@/types/definitions";
import { updateInbodyManual, updateUserGoal, getMypage } from "@/api/index";
import { useUserStore, useDietStore } from "@/store";

interface MypageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    inbodyData: Partial<InbodyRecord> | null;
    onSave?: (updatedData: Partial<InbodyRecord>) => void;
}

export default function MypageDetailModal({ isOpen, onClose, inbodyData, onSave }: MypageDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 편집용 로컬 state
    const [editWeight, setEditWeight] = useState<string>("");
    const [editHeight, setEditHeight] = useState<string>("");
    const [editMuscleMass, setEditMuscleMass] = useState<string>("");
    const [editBodyFatPct, setEditBodyFatPct] = useState<string>("");
    const [editBmr, setEditBmr] = useState<string>("");

    // zustand store
    const { user } = useUserStore();
    const { resetDiet } = useDietStore();

    // 모달 열릴 때 편집값 초기화
    useEffect(() => {
        if (isOpen && inbodyData) {
            setEditWeight(inbodyData.weight?.toString() || "");
            setEditHeight(inbodyData.height?.toString() || "");
            setEditMuscleMass(inbodyData.skeletal_muscle_mass?.toString() || "");
            setEditBodyFatPct(inbodyData.body_fat_pct?.toString() || "");
            setEditBmr(inbodyData.bmr?.toString() || "");
        }
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen, inbodyData]);

    if (!isOpen) return null;

    // BMI 자동 계산
    const calculateBMI = (w: string, h: string): string => {
        const weight = parseFloat(w);
        const height = parseFloat(h);
        if (weight > 0 && height > 0) {
            return (weight / ((height / 100) ** 2)).toFixed(1);
        }
        return "-";
    };

    // 데이터가 없을 경우 기본값 처리
    const formatValue = (value: number | undefined, unit: string) => {
        return value ? `${value} ${unit}` : "-";
    };

    // BMR 추정 (Mifflin-St Jeor)
    const estimateBMR = (weight: number, height: number): number => {
        // 나이/성별 정보 없으면 기본값(30세/남성)
        return (10 * weight) + (6.25 * height) - (5 * 30) + 5;
    };

    // 저장 핸들러
    const handleSave = async () => {
        const userNumber = user?.user_number;
        if (!userNumber) {
            alert("로그인 정보가 없습니다.");
            return;
        }

        setIsSaving(true);
        try {
            const weight = parseFloat(editWeight) || undefined;
            const height = parseFloat(editHeight) || undefined;
            const skeletal_muscle_mass = parseFloat(editMuscleMass) || undefined;
            const body_fat_pct = parseFloat(editBodyFatPct) || undefined;
            const bmr = parseFloat(editBmr) || undefined;
            const bmi = (weight && height) ? parseFloat((weight / ((height / 100) ** 2)).toFixed(1)) : undefined;

            // 1. Inbody 데이터 저장
            const res = await updateInbodyManual({
                user_number: userNumber,
                weight,
                height,
                skeletal_muscle_mass,
                body_fat_pct,
                bmr,
                bmi,
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => "");
                console.error("인바디 저장 실패:", res.status, errText);
                alert("저장에 실패했습니다.");
                return;
            }

            // 2. 목표 칼로리 재계산 (옵션 B)
            try {
                // 현재 활동 수준과 목표 타입 가져오기
                const userId = localStorage.getItem("user_id");
                const mypageRes = await getMypage(userId);
                if (mypageRes.ok) {
                    const mypageData = await mypageRes.json();
                    const goalType = mypageData.goal?.goal_type;
                    const activityFactor = mypageData.body?.activity_factor || 1.375;

                    if (goalType) {
                        const finalBmr = bmr || (weight && height ? estimateBMR(weight, height) : null);
                        if (finalBmr) {
                            const tdee = finalBmr * activityFactor;
                            let targetCalorie = Math.round(tdee);
                            if (goalType === "다이어트") targetCalorie = Math.round(tdee * 0.85);
                            else if (goalType === "증량") targetCalorie = Math.round(tdee * 1.15);

                            await updateUserGoal(userNumber, goalType, targetCalorie);
                            resetDiet(); // 식단 리셋
                        }
                    }
                }
            } catch (goalErr) {
                console.error("목표 칼로리 재계산 실패 (인바디는 저장됨):", goalErr);
            }

            // 3. 부모 컴포넌트에 알림
            const updatedData: Partial<InbodyRecord> = {
                ...inbodyData,
                weight,
                height,
                skeletal_muscle_mass,
                body_fat_pct,
                bmr,
                bmi,
            };

            alert("체성분 정보가 저장되었습니다!");
            setIsEditing(false);
            onSave?.(updatedData);

        } catch (err) {
            console.error("저장 오류:", err);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const currentBMI = isEditing
        ? calculateBMI(editWeight, editHeight)
        : (inbodyData?.bmi
            ? inbodyData.bmi.toString()
            : (inbodyData?.weight && inbodyData?.height)
                ? (inbodyData.weight / ((inbodyData.height / 100) ** 2)).toFixed(1)
                : "-");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 relative">
                    <h3 className="font-bold text-slate-800 text-lg w-full text-center">체성분 상세</h3>
                    <div className="absolute right-4 flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                                title="수정"
                            >
                                <Pencil size={20} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-sm text-slate-500 mb-1">체중</span>
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={editWeight}
                                        onChange={(e) => setEditWeight(e.target.value)}
                                        className="w-20 text-center text-lg font-bold border-b-2 border-indigo-300 bg-transparent outline-none focus:border-indigo-500"
                                        placeholder="0"
                                        step="0.1"
                                    />
                                    <span className="text-sm text-slate-500">kg</span>
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-slate-800">
                                    {formatValue(inbodyData?.weight, "kg")}
                                </span>
                            )}
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-sm text-slate-500 mb-1">신장</span>
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={editHeight}
                                        onChange={(e) => setEditHeight(e.target.value)}
                                        className="w-20 text-center text-lg font-bold border-b-2 border-indigo-300 bg-transparent outline-none focus:border-indigo-500"
                                        placeholder="0"
                                        step="0.1"
                                    />
                                    <span className="text-sm text-slate-500">cm</span>
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-slate-800">
                                    {formatValue(inbodyData?.height, "cm")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Composition */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-3 ml-1">상세 성분</h4>
                        <div className="space-y-3">
                            {/* 골격근량 */}
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">골격근량</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={editMuscleMass}
                                            onChange={(e) => setEditMuscleMass(e.target.value)}
                                            className="w-20 text-right font-bold border-b-2 border-indigo-300 bg-transparent outline-none focus:border-indigo-500"
                                            placeholder="0"
                                            step="0.1"
                                        />
                                        <span className="text-sm text-slate-500">kg</span>
                                    </div>
                                ) : (
                                    <span className="font-bold text-slate-800">
                                        {formatValue(inbodyData?.skeletal_muscle_mass, "kg")}
                                    </span>
                                )}
                            </div>

                            {/* 체지방률 */}
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">체지방률</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={editBodyFatPct}
                                            onChange={(e) => setEditBodyFatPct(e.target.value)}
                                            className="w-20 text-right font-bold border-b-2 border-indigo-300 bg-transparent outline-none focus:border-indigo-500"
                                            placeholder="0"
                                            step="0.1"
                                        />
                                        <span className="text-sm text-slate-500">%</span>
                                    </div>
                                ) : (
                                    <span className="font-bold text-slate-800">
                                        {formatValue(inbodyData?.body_fat_pct, "%")}
                                    </span>
                                )}
                            </div>

                            {/* BMI (자동계산, 읽기 전용) */}
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">체질량지수 (BMI)</span>
                                <span className="font-bold text-slate-800">
                                    {currentBMI}
                                </span>
                            </div>

                            {/* BMR */}
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">기초대사량 (BMR)</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={editBmr}
                                            onChange={(e) => setEditBmr(e.target.value)}
                                            className="w-20 text-right font-bold border-b-2 border-indigo-300 bg-transparent outline-none focus:border-indigo-500"
                                            placeholder="0"
                                            step="1"
                                        />
                                        <span className="text-sm text-slate-500">kcal</span>
                                    </div>
                                ) : (
                                    <span className="font-bold text-slate-800">
                                        {formatValue(inbodyData?.bmr || (inbodyData as any)?.values?.bmr, "kcal")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    "저장"
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-indigo-300 text-white font-bold rounded-xl hover:bg-indigo-400 transition-colors shadow-sm"
                        >
                            닫기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
