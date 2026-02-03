"use client";

import { X } from "lucide-react";
import { InbodyRecord } from "@/types/definitions";

interface MypageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    inbodyData: Partial<InbodyRecord> | null;
}

export default function MypageDetailModal({ isOpen, onClose, inbodyData }: MypageDetailModalProps) {
    if (!isOpen) return null;

    // 데이터가 없을 경우 기본값 처리를 하거나 비워둠
    const formatValue = (value: number | undefined, unit: string) => {
        return value ? `${value} ${unit}` : "-";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 relative">
                    <h3 className="font-bold text-slate-800 text-lg w-full text-center">체성분 상세</h3>
                    <button
                        onClick={onClose}
                        className="absolute right-4 text-slate-500 hover:text-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-sm text-slate-500 mb-1">체중</span>
                            <span className="text-xl font-bold text-slate-800">
                                {formatValue(inbodyData?.weight, "kg")}
                            </span>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl flex flex-col items-center">
                            <span className="text-sm text-slate-500 mb-1">신장</span>
                            <span className="text-xl font-bold text-slate-800">
                                {formatValue(inbodyData?.height, "cm")}
                            </span>
                        </div>
                    </div>

                    {/* Composition */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-3 ml-1">상세 성분</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">골격근량</span>
                                <span className="font-bold text-slate-800">
                                    {formatValue(inbodyData?.skeletal_muscle_mass, "kg")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">체지방률</span>
                                <span className="font-bold text-slate-800">
                                    {formatValue(inbodyData?.body_fat_pct, "%")}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">체질량지수 (BMI)</span>
                                <span className="font-bold text-slate-800">
                                    {/* BMI가 API 데이터에 있으면 표시, 없으면 계산 */}
                                    {inbodyData?.bmi
                                        ? inbodyData.bmi
                                        : (inbodyData?.weight && inbodyData?.height)
                                            ? (inbodyData.weight / ((inbodyData.height / 100) ** 2)).toFixed(1)
                                            : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-xl">
                                <span className="text-slate-600">기초대사량 (BMR)</span>
                                <span className="font-bold text-slate-800">
                                    {formatValue(inbodyData?.bmr, "kcal")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer (Optional) */}
                <div className="p-4 border-t bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
