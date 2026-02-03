
"use client"
import { useState, useEffect, useRef } from "react"
import { InbodyRecord } from '@/types/definitions'
import { getInbody, uploadInbodyImage } from "@/api/index"
import { Plus, Upload, Activity } from "lucide-react"
import MypageDetailModal from "./MypageDetailModal"

interface MypageBodyCompositionProps {
    inbodyDataProp?: Partial<InbodyRecord> | null;
    onInbodyUpdate?: () => void;
}

export default function MypageBodyComposition({ inbodyDataProp, onInbodyUpdate }: MypageBodyCompositionProps) {
    const [inbodyData, setInbodyData] = useState<Partial<InbodyRecord> | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (inbodyDataProp) {
            setInbodyData(inbodyDataProp);
            return;
        }

        const fetchData = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                const response = await getInbody(userId);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    setInbodyData(data[0]);
                } else if (data && !Array.isArray(data)) {
                    setInbodyData(data);
                }
            } catch (error) {
                console.error("Failed to fetch inbody data:", error);
            }
        };
        fetchData();
    }, [inbodyDataProp]);

    // Handle File Upload Logic (Adapted from InbodyUpload)
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isUploading) {
            e.target.value = "";
            return;
        }
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsMenuOpen(false); // Close menu during upload

        try {
            const formData = new FormData();
            formData.append("image", file, file.name);

            const response = await uploadInbodyImage(formData, { timeoutMs: 600000 });

            if (response.ok) {
                alert("인바디 데이터가 업로드되었습니다!");
                // Refresh Data
                const userId = localStorage.getItem("user_id");
                const dataRes = await getInbody(userId);
                if (dataRes.ok) {
                    const data = await dataRes.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setInbodyData(data[0]);
                    } else if (data && !Array.isArray(data)) {
                        setInbodyData(data);
                    }
                    if (onInbodyUpdate) onInbodyUpdate();
                }
            } else {
                const errText = await response.text().catch(() => "");
                console.error("업로드 실패:", response.status, errText);
                alert("업로드에 실패했습니다.");
            }
        } catch (err) {
            console.error("업로드 오류:", err);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };


    return (
        <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 shadow-sm border border-indigo-100/50 relative">

            {/* Header with Title and Menu */}
            <div className="flex justify-between items-center mb-4 relative z-20">
                <h2 className="text-lg font-bold text-slate-800">체성분</h2>

                {/* Menu System */}
                <div className="relative">
                    {/* Collapsed Menu Items - show when open */}
                    <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 flex gap-2 transition-all duration-200 ${isMenuOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                        {/* Detail Button */}
                        <button
                            onClick={() => {
                                setIsDetailModalOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-400 shadow-sm flex items-center justify-center hover:bg-indigo-100 transition-colors"
                            title="상세보기"
                        >
                            <Activity size={16} />
                        </button>

                        {/* Upload Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 shadow-md flex items-center justify-center hover:bg-blue-200 disabled:opacity-50"
                            title="업로드"
                        >
                            <Upload size={16} />
                        </button>
                    </div>

                    {/* Checkbox/Input for accessibility or just use button state */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isMenuOpen ? 'bg-slate-200 rotate-45 text-slate-600' : 'bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="card-container">
                {/* <button className="text-xs text-gray-400 hover:text-gray-600 absolute top-5 right-12">더보기 &gt;</button> */}
                {/* 더보기 버튼은 이제 메뉴의 상세보기가 대체함 */}

                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-white/60 backdrop-blur-sm border border-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs font-medium text-slate-500 mb-1">체중</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.weight || '-'} <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs font-medium text-slate-500 mb-1">신장</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.height || '-'} <span className="text-sm font-normal text-slate-500">cm</span>
                        </span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs font-medium text-slate-500 mb-1">골격근량</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.skeletal_muscle_mass || '-'}
                            <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm border border-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-xs font-medium text-slate-500 mb-1">체지방률</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {inbodyData?.body_fat_pct || '-'} <span className="text-sm font-normal text-slate-500">%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Hidden Input for Upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            {/* Detail Modal */}
            <MypageDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                inbodyData={inbodyData}
            />
        </section>
    );
}
