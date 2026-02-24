"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import { uploadInbodyImage, getInbody } from "@/api/index";
import { useUserStore } from "@/store";

export default function InbodyOnboardingPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const user = useUserStore((state) => state.user);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", selectedImage);

            // user_number를 추가하여 백엔드가 사용자를 식별할 수 있게 함
            if (user?.user_number) {
                formData.append("user_number", String(user.user_number));
            }

            const res = await uploadInbodyImage(formData);

            if (res.ok) {
                setUploadStatus('success');
                setTimeout(() => {
                    router.push("/onboarding/survey");
                }, 1500);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Inbody upload error:", error);
            setUploadStatus('error');
            alert("인바디 이미지 분석에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSkip = () => {
        if (confirm("인바디 정보를 등록하지 않으면 정확한 분석이 어려울 수 있습니다. 건너뛰시겠습니까?")) {
            router.push("/onboarding/survey");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between">
                {/* Only show back if needed, but this is onboarding so maybe not needed or leads to login */}
                <div className="w-8"></div>
                <h1 className="text-lg font-bold text-slate-800">인바디 등록</h1>
                <button onClick={handleSkip} className="text-sm text-slate-400 hover:text-slate-600">
                    건너뛰기
                </button>
            </header>

            <main className="flex-1 px-6 py-8 flex flex-col items-center">


                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {user?.username ? `${user.username}님,` : ""} <br />
                            <span className="text-indigo-600">인바디 결과지</span>가 있나요?
                        </h2>
                        <p className="text-slate-500 text-sm">
                            결과지를 촬영하여 업로드하면<br />
                            AI가 신체 정보를 자동으로 분석해드려요.
                        </p>
                    </div>

                    {/* Image Preview / Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative w-full aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                            ${previewUrl ? "border-indigo-200 bg-slate-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100"}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                    <Camera size={32} />
                                </div>
                                <span className="font-medium">터치하여 사진 업로드</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Action */}
            <div className="p-6 pb-10 bg-white">
                <button
                    onClick={handleUpload}
                    disabled={!selectedImage || isUploading}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200/50
                        ${!selectedImage
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isUploading
                                ? "bg-indigo-400 text-white cursor-wait"
                                : uploadStatus === 'success'
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                        }
                    `}
                >
                    {isUploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>분석 중...</span>
                        </>
                    ) : uploadStatus === 'success' ? (
                        <>
                            <CheckCircle2 size={24} />
                            <span>분석 완료!</span>
                        </>
                    ) : (
                        <>
                            <span>분석 시작하기</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
