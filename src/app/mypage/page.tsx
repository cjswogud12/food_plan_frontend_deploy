"use client"
import { useViewport } from "@/context/ViewportContext"
import { useState, useEffect } from "react"
import { Record as FoodRecord } from "@/types/definitions"
import { User, Settings, Megaphone, HelpCircle, ChevronRight, Target, Bell, Link } from "lucide-react"
import FloatingCameraButton from "@/components/FloatingCameraButton"
import { InbodyRecord } from "@/types/definitions"
import InbodyUpload from "@/components/InbodyUploadAndHistory"
import MypageInbody from "@/components/mypage/MypageInbody"
import MypageMenuSeeMore from "@/components/mypage/MypageMenuSeeMore"
import MypageMenu from "@/components/mypage/MypageMenu"
import MypageProfileTarget from "@/components/mypage/MypageProfileTarget"
import { getInbody, getUserGoal, getMypage } from "@/api/index"
import MypageFixLogoutBt from "@/components/mypage/MypageFixLogoutBt"
import { useUserStore } from "@/store"


export default function Mypage() {
    const { isMobile } = useViewport();
    const [foodrecords, setFoodRecords] = useState<FoodRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inbodyrecords, setInbodyRecords] = useState<Partial<InbodyRecord>[]>([]);
    const [goal, setGoal] = useState<string | null>("-");
    const [refreshKey, setRefreshKey] = useState(0);

    // Zustand store
    const { setUserGoal } = useUserStore();

    // API에서 goal 가져오기
    useEffect(() => {
        console.log("🎯 [MYPAGE] Fetching user goal... (refreshKey:", refreshKey, ")");
        getUserGoal()
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 404) {
                        console.log("🎯 [MYPAGE] Goal not found (404), clearing goal state");
                        return null;
                    }
                    throw new Error(`Goal fetch failed: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!data) {
                    console.log("🎯 [MYPAGE] No goal data, setting goal to null");
                    setGoal(null);
                    setUserGoal(null); // ✅ Zustand store도 초기화!
                    return;
                }
                if (Array.isArray(data) && data.length > 0) {
                    console.log("🎯 [MYPAGE] Goal found (array):", data[0].goal_type);
                    setGoal(data[0].goal_type ?? null);
                    setUserGoal(data[0]); // ✅ Zustand store 업데이트
                } else if (data?.goal_type) {
                    console.log("🎯 [MYPAGE] Goal found (object):", data.goal_type);
                    setGoal(data.goal_type);
                    setUserGoal(data); // ✅ Zustand store 업데이트
                } else {
                    console.log("🎯 [MYPAGE] Goal data exists but no goal_type, setting to null");
                    setGoal(null);
                    setUserGoal(null); // ✅ Zustand store도 초기화!
                }
            })
            .catch((err) => {
                console.error("🎯 [MYPAGE] Goal fetch error:", err);
                setGoal(null);
                setUserGoal(null); // ✅ Zustand store도 초기화!
            });
    }, [refreshKey, setUserGoal]); // refreshKey 추가!

    const [inbodyData, setInbodyData] = useState<Partial<InbodyRecord> | null>(null);


    // ...

    // return (
    //     // ...
    //     {/* 2. 체성분 (mypage_inbody.tsx) */ }
    //     < MypageInbody inbodyDataProp = { inbodyData } />
    //     // ...
    // );

    const mapOcrToDisplay = (data: unknown): Partial<InbodyRecord> | null => {
        const values = (data as { values?: Record<string, unknown> } | null)?.values;
        if (!values || typeof values !== "object") return null;

        return {
            height: typeof values.height === "number" ? values.height : undefined,
            weight: typeof values.weight === "number" ? values.weight : undefined,
            skeletal_muscle_mass:
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
            <div className="p-4 flex flex-col gap-4 pb-24 bg-white">
                <h1 className="text-lg font-bold text-slate-800">마이페이지</h1>
                {/* 1. 유저 프로필 섹션 (mypage_profile_target.tsx) */}
                <MypageProfileTarget key={refreshKey} foodrecords={foodrecords} goal={goal} />

                {/* 2. 체성분 (mypage_inbody.tsx) */}
                <MypageInbody
                    inbodyDataProp={inbodyData}
                    onInbodyUpdate={() => setRefreshKey(prev => prev + 1)}
                />

                {/* 3. 메뉴 (mypage_menu.tsx) */}
                <MypageMenu onGoalChange={setGoal} />

                {/* 4. 더보기 (mypage_menu_see_more.tsx) */}
                <MypageMenuSeeMore />

                {/* 5. 추가 버튼 섹션 (회원정보수정, 로그아웃) */}
                <MypageFixLogoutBt />
            </div>
            <FloatingCameraButton onUploadSuccess={refreshInbody} />
        </>
    );
}

