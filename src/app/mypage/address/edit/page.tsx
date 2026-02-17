"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Building2, Check } from "lucide-react";
import { useUserStore } from "@/store";
import { getUserAddress, updateUserAddress, type UserAddressData } from "@/api/index";

export default function AddressEditPage() {
    const router = useRouter();
    const { user } = useUserStore();

    const [homeAddress, setHomeAddress] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 초기 주소 로드
    useEffect(() => {
        const loadAddress = async () => {
            if (user?.user_number) {
                try {
                    const res = await getUserAddress(user.user_number);
                    if (res.ok) {
                        const data: UserAddressData = await res.json();
                        if (data.home_address) setHomeAddress(data.home_address);
                        if (data.company_address) setCompanyAddress(data.company_address);
                    }
                } catch (error) {
                    console.error("주소 불러오기 실패:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        loadAddress();
    }, [user]);

    // 유효성 검사 (지금은 둘 다 입력해야 저장 가능하도록, 필요시 수정)
    const isValid = homeAddress.trim().length > 0 && companyAddress.trim().length > 0;

    const handleSave = async () => {
        if (!isValid || !user?.user_number) return;

        setIsSubmitting(true);
        try {
            const payload: UserAddressData = {
                user_number: user.user_number,
                home_address: homeAddress,
                company_address: companyAddress
            };

            const res = await updateUserAddress(payload);

            if (res.ok) {
                router.push("/mypage/address");
            } else {
                console.error("주소 저장 실패");
                alert("주소 저장에 실패했습니다.");
            }
        } catch (error) {
            console.error("주소 저장 에러:", error);
            alert("처리 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800">주소 수정</h1>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col overflow-y-auto">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    {/* 안내 문구 */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-800">
                            자주 가는 장소를<br />
                            설정해주세요
                        </h2>
                        <p className="text-slate-500 text-sm">
                            정확한 위치 기반 추천을 위해 필요해요.
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
                            placeholder="예: 충청남도 천안시 동남구 백석대학로 1-1"
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

            {/* 하단 저장 버튼 */}
            <div className="p-6 pb-10 bg-white border-t border-slate-100">
                <button
                    onClick={handleSave}
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
                            <span>저장 중...</span>
                        </>
                    ) : (
                        <>
                            <span>저장하기</span>
                            <Check size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
