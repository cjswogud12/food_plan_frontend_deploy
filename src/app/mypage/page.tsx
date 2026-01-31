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


export default function Mypage() {
    const { isMobile } = useViewport();
    const [foodrecords, setFoodRecords] = useState<FoodRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inbodyrecords, setInbodyRecords] = useState<Partial<InbodyRecord>[]>([]);
    const [goal, setGoal] = useState<string>("-");
    const [refreshKey, setRefreshKey] = useState(0);

    // API에서 goal 가져오기
    useEffect(() => {
        getUserGoal()
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.goal_type) setGoal(data.goal_type);
            })
            .catch(err => console.error("Goal fetch error:", err));
    }, []);

    const [inbodyData, setInbodyData] = useState<Partial<InbodyRecord> | null>(null);

    // ... (rest of the state and useEffects)

    useEffect(() => {
        // 식단 기록 및 마이페이지 데이터 가져오기
        const userId = localStorage.getItem("user_id");
        getMypage(userId)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("서버 응답 오류")
                }
                return res.json();
            })
            .then((data) => {
                // 백엔드 응답 구조: { user, body, goal, diet_plan, records }
                if (data.records) {
                    setFoodRecords(data.records);
                } else if (Array.isArray(data)) {
                    // 혹시 이전 구조일 경우 대비
                    setFoodRecords(data);
                }

                if (data.body) {
                    setInbodyData({
                        height: data.body.height,
                        weight: data.body.weight,
                        skeletal_muscle_mass: data.body.skeletal_muscle_mass,
                        body_fat_pct: data.body.body_fat_percent // API 응답 필드명 확인 (body_fat_percent -> body_fat_pct 매핑)
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("API 호출 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
                setLoading(false);
            });

        // getInbody() 호출은 중복되므로 제거하거나, refresh 용도로 남겨둘 수 있음.
        // 여기서는 getMypage에서 다 가져오므로 제거.
    }, []);

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
            <div className="p-4 flex flex-col gap-4 pb-24 bg-purple-100">
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

