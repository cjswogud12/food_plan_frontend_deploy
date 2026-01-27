"use client"
import { useViewport } from "@/context/ViewportContext"
import { useState, useEffect } from "react"
import { Record as FoodRecord } from "@/types/record"
import { User, Settings, Megaphone, HelpCircle, ChevronRight, Target, Bell, Link } from "lucide-react"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { InbodyRecord } from "@/types/inbodyrecord"
import { getInbody } from "@/api/inbody"
import InbodyUpload from "@/components/InbodyUpload"
import FoodListData from "@/components/mypage_food_list_data"
import MypageInbody from "@/components/mypage_inbody"
import MypageFoodChart from "@/components/mypage_food_chart"
import MypageMenuSeeMore from "@/components/mypage_menu_see_more"
import MypageMenu from "@/components/mypage_menu"
import MypageProfileTarget from "@/components/mypage_profile_target"


export default function Mypage() {
    const { isMobile } = useViewport();
    const [foodrecords, setFoodRecords] = useState<FoodRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inbodyrecords, setInbodyRecords] = useState<Partial<InbodyRecord>[]>([]);

    useEffect(() => {
        // 식단 기록 가져오기
        fetch("http://localhost:8000/api/mypage")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("서버 응답 오류")
                }
                return res.json();
            })
            .then((data) => {
                const recordList = Array.isArray(data) ? data : [data];
                setFoodRecords(recordList);
                setLoading(false);
            })
            .catch((err) => {
                console.error("API 호출 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
                setLoading(false);
            });

        // 인바디 기록 가져오기
        getInbody()
            .then((res) => {
                if (!res.ok) throw new Error("인바디 데이터 오류");
                return res.json();
            })
            .then((data) => {
                const inbodyList = Array.isArray(data) ? data : [data];
                setInbodyRecords(inbodyList);
            })
            .catch((err) => {
                console.error("인바디 API 호출 실패:", err);
            });
    }, []);

    const mapOcrToDisplay = (data: unknown): Partial<InbodyRecord> | null => {
        const values = (data as { values?: Record<string, unknown> } | null)?.values;
        if (!values || typeof values !== "object") return null;

        return {
            height: typeof values.height === "number" ? values.height : undefined,
            weight: typeof values.weight === "number" ? values.weight : undefined,
            skeleton_muscle_mass:
                typeof values.skeletal_muscle_mass === "number" ? values.skeletal_muscle_mass : undefined,
            body_fat_pct:
                typeof values.body_fat_pct === "number" ? values.body_fat_pct : undefined,
            bmr: typeof values.bmr === "number" ? values.bmr : undefined,
        };
    };
    // 인바디 데이터 새로고침
    const refreshInbody = (ocrData?: unknown) => {
        const mapped = mapOcrToDisplay(ocrData);
        if (mapped) {
            setInbodyRecords([mapped]);
            return;
        }
        getInbody()
            .then((res) => {
                if (!res.ok) throw new Error("인바디 데이터 오류");
                return res.json();
            })
            .then((data) => {
                const inbodyList = Array.isArray(data) ? data : [data];
                setInbodyRecords(inbodyList);
            })
            .catch((err) => {
                console.error("인바디 API 호출 실패:", err);
            });
    };

    return (
        <>
            <header>
                <span>{isMobile ? '모바일' : 'PC'}</span>
            </header>
            <main className="p-4 flex flex-col gap-4 pb-24 h-full overflow-y-auto bg-purple-100">
                <h1 className="text-lg font-bold text-slate-800">마이페이지</h1>
                {/* 1. 유저 프로필 섹션 (mypage_profile_target.tsx) */}
                <MypageProfileTarget foodrecords={foodrecords} />

                {/* 2. 식단 통계 (mypage_food_chart.tsx)*/}
                <MypageFoodChart />

                {/* 3. 체성분 (mypage_inbody.tsx) */}
                <MypageInbody />

                {/* 4. 음식 기록 섹션 (mypage_food_list_data.tsx) */}
                <FoodListData loading={loading} error={error} foodrecords={foodrecords} />

                {/* 5. 메뉴 (mypage_menu.tsx) */}
                <MypageMenu />

                {/* 6. 더보기 (mypage_menu_see_more.tsx) */}
                <MypageMenuSeeMore />

                {/* 7. 추가 버튼 섹션 (회원정보수정, 로그아웃) */}
                <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
                        회원정보수정
                    </button>
                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors">
                        로그아웃
                    </button>
                </div>
            </main>
            <FloatingCameraButton onUploadSuccess={refreshInbody} />
        </>
    );
}

