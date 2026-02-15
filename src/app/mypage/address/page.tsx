"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Building2, Pencil } from "lucide-react";
import { useUserStore } from "@/store";
import { getUserAddress, UserAddressData } from "@/api/index";

export default function AddressPage() {
    const router = useRouter();
    const [addressData, setAddressData] = useState<UserAddressData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAddress = async () => {
            const userId = localStorage.getItem("user_id");
            // user_id가 없거나 문자열인 경우 처리 (API는 숫자를 요구할 수 있음)
            // 현재 getUserAddress는 userNumber(number)를 받음.
            // 로컬스토리지 user_id는 보통 string. UserStore에서 번호를 가져오는 게 더 정확할 수 있음.
            // 여기서는 심플하게 로컬스토리지나 store 사용. Store 사용 권장.

            // 임시: user_number를 얻기 위해 userStore 사용 권장하지만, 간단히 구현
            // 실제로는 useUserStore() 사용이 좋음.

            // 여기서는 일단 가상의 userNumber 1 사용하거나, store 연동.
            // useUserStore import 필요.
        };
        // fetchAddress();
    }, []);

    // Store 사용으로 변경
    const { user } = useUserStore();

    useEffect(() => {
        const loadAddress = async () => {
            if (user?.user_number) {
                try {
                    const res = await getUserAddress(user.user_number);
                    if (res.ok) {
                        const data = await res.json();
                        setAddressData(data);
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

    // 로딩 상태 처리? (선택사항, 현재는 그냥 빈 값 보여춤)

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
                <h1 className="text-lg font-bold text-slate-800">주소 설정</h1>
            </header>

            <main className="flex-1 px-6 py-6 flex flex-col gap-6">

                {/* 집 주소 카드 */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Home size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">집</h3>
                            <p className="text-xs text-slate-400">나의 보금자리</p>
                        </div>
                    </div>
                    <div className="pl-1">
                        {addressData?.home_address ? (
                            <p className="text-slate-700 leading-relaxed font-medium">
                                {addressData.home_address}
                            </p>
                        ) : (
                            <p className="text-slate-400 text-sm">
                                등록된 주소가 없습니다.
                            </p>
                        )}
                    </div>
                </div>

                {/* 회사 주소 카드 */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">회사</h3>
                            <p className="text-xs text-slate-400">일하는 곳</p>
                        </div>
                    </div>
                    <div className="pl-1">
                        {addressData?.company_address ? (
                            <p className="text-slate-700 leading-relaxed font-medium">
                                {addressData.company_address}
                            </p>
                        ) : (
                            <p className="text-slate-400 text-sm">
                                등록된 주소가 없습니다.
                            </p>
                        )}
                    </div>
                </div>

            </main>

            {/* 하단 수정 버튼 */}
            <div className="p-6 pb-10 bg-white border-t border-slate-100">
                <button
                    onClick={() => router.push("/mypage/address/edit")}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
                >
                    <Pencil size={20} />
                    <span>주소 수정하기</span>
                </button>
            </div>
        </div>
    );
}
