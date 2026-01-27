"use client"
import { useViewport } from "@/context/ViewportContext"
import { useState, useEffect } from "react"
import { Record } from "@/types/record"
import { User, Settings, Megaphone, HelpCircle, ChevronRight, Target, Bell, Link } from "lucide-react"
import FoodListData from "@/components/mypage_food_list_data"
import MypageInbody from "@/components/mypage_inbody"
import MypageFoodChart from "@/components/mypage_food_chart"
import MypageMenuSeeMore from "@/components/mypage_menu_see_more"
import MypageMenu from "@/components/mypage_menu"
import MypageProfileTarget from "@/components/mypage_profile_target"


export default function Mypage() {
    const { isMobile } = useViewport();
    const [foodrecords, setFoodRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/mypage")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("서버 응답 오류")
                }
                return res.json();
            })
            .then((data) => { //배열이 아니면 배열로 감싸기
                const recordList = Array.isArray(data) ? data : [data];
                setFoodRecords(recordList);
                setLoading(false);
            })
            .catch((err) => {
                console.error("API 호출 실패:", err);
                setError("데이터를 불러오는데 실패했습니다.");
                setLoading(false);
            });
    }, []);

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
        </>
    );
}