"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, Building2 } from "lucide-react";

export default function AddressPage() {
    const router = useRouter();
    const [homeAddress, setHomeAddress] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = homeAddress.trim().length > 0 && companyAddress.trim().length > 0;

    const handleConfirm = async () => {
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const locations = [
                {
                    label: "home",
                    address_text: homeAddress.trim(),
                    radius_m: 500,
                },
                {
                    label: "company",
                    address_text: companyAddress.trim(),
                    radius_m: 500,
                },
            ];

            // TODO: 백엔드 엔드포인트 연결
            // await postJson("/user/locations", { locations });
            console.log("전송할 주소 데이터:", locations);

            router.push("/");
        } catch (error) {
            console.error("주소 제출 실패:", error);
            alert("제출에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-center">
                <h1 className="text-lg font-bold text-slate-800">주소 설정</h1>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    {/* 안내 문구 */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">
                            <span className="text-indigo-600">주변 식당 검색</span>을 위해
                            <br />
                            주소를 입력해주세요
                        </h2>
                        <p className="text-slate-500 text-sm">
                            집과 회사 주변의 맞춤 식단을 추천해드려요.
                        </p>
                    </div>

                    {/* 집 주소 입력 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Home size={18} className="text-indigo-600" />
                            </div>
                            <span className="font-bold text-slate-700">집 주소</span>
                            <span className="text-xs text-red-400 font-medium">필수</span>
                        </div>
                        <input
                            type="text"
                            value={homeAddress}
                            onChange={(e) => setHomeAddress(e.target.value)}
                            placeholder="예: 충청남도 천안시 동남구 백석대학로 1-1 진리관"
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:border-indigo-300 focus:bg-white transition-all"
                        />
                    </div>

                    {/* 회사 주소 입력 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Building2 size={18} className="text-purple-600" />
                            </div>
                            <span className="font-bold text-slate-700">회사 주소</span>
                            <span className="text-xs text-red-400 font-medium">필수</span>
                        </div>
                        <input
                            type="text"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="예: 서울 중구 세종대로 110"
                            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </main>

            {/* 하단 확인 버튼 */}
            <div className="p-6 pb-10 bg-white">
                <button
                    onClick={handleConfirm}
                    disabled={!isValid || isSubmitting}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200/50
                        ${!isValid
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : isSubmitting
                                ? "bg-indigo-400 text-white cursor-wait"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                        }
                    `}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>처리 중...</span>
                        </>
                    ) : (
                        <>
                            <span>시작하기</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
