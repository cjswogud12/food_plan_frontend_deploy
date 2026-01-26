"use client"
import { useViewport } from "@/context/ViewportContext"
import { useState, useEffect } from "react"
import { Record } from "@/types/record"
import { User, Settings, Megaphone, HelpCircle, ChevronRight, Target, Bell, Link } from "lucide-react"


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

                {/* 1. 유저 프로필 섹션 */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="card-container w-full">
                        <div className="flex items-center gap-4">
                            {/* Left: Profile Icon */}
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500">
                                <User size={24} />
                            </div>

                            {/* Center: Info & Progress */}
                            <div className="flex-1 flex flex-col gap-1">
                                <div className="flex justify-between items-end">
                                    <h2 className="text-lg font-bold text-slate-800">UserName</h2>
                                    <span className="text-sm font-bold text-purple-600">100%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                                </div>
                            </div>

                            {/* Right: Button */}
                            <button className="p-2 text-slate-400 hover:text-slate-600 bg-purple-500 text-white rounded-full">목표 변경</button>
                        </div>

                        {/* API 연동 확인 (목표 칼로리) */}
                        {foodrecords.length > 0 && (
                            <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "16px" }}>
                                목표: {foodrecords[0].goal_calories} kcal
                            </p>
                        )}
                    </div>
                </section>


                {/* 2. 식단 통계*/}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="card-container w-full">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">식단 통계</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-xs font-medium text-slate-500 mb-1">식단 유형</span>
                                <span className="text-lg font-bold text-purple-600">다이어트</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-xs font-medium text-slate-500 mb-1">달성률</span>
                                <span className="text-lg font-bold text-purple-600">85%</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-xs font-medium text-slate-500 mb-1">음식 양</span>
                                <span className="text-lg font-bold text-purple-600">450g</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-xs font-medium text-slate-500 mb-1">칼로리</span>
                                <span className="text-lg font-bold text-purple-600">1,200kcal</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 체성분 */}
                <section className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="card-container">
                        <h2 className="text-lg font-bold text-slate-800">체성분</h2>
                        <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center">
                                <span className="text-sm text-green-700 mb-1 font-medium">체중</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {/*userData?.weight || '0'*/} <span className="text-sm font-normal text-slate-500">kg</span>
                                </span>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
                                <span className="text-sm text-blue-700 mb-1 font-medium">골격근량</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {/*userData?.muscle || '0'*/}
                                    <span className="text-sm font-normal text-slate-500">kg</span>
                                </span>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex flex-col items-center justify-center col-span-2">
                                <span className="text-sm text-pink-700 mb-1 font-medium">체지방률</span>
                                <span className="text-2xl font-bold text-slate-800">
                                    {/*recordData?.fatRate || '0'*/} <span className="text-sm font-normal text-slate-500">%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. 음식 기록 섹션 */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="card-container w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">음식 기록 데이터</h2>
                            <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            {/* 로딩/에러/없음 상태 */}
                            {loading && <p>로딩 중.....</p>}
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            {!loading && !error && foodrecords.length === 0 && (<p>기록이 없습니다.</p>)}

                            {/* 음식 목록 */}
                            {!loading && !error && foodrecords.map((record) => (
                                <div key={record.record_id}
                                    style={{
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                        padding: "12px",
                                        marginBottom: "8px",
                                        backgroundColor: "#f9f9f9"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontWeight: "bold" }}>{record.food_name}</span>
                                        <span>{record.food_calories} kcal</span>
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                        {record.record_created_at}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 내 정보, 목표 설정, 알림 설정, 계정 연동 아이콘 섹션 */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="card-container w-full">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                    <User size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">내 정보</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                    <Target size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">목표 설정</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                    <Bell size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">알림 설정</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                                    <Link size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">계정 연동</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 더보기 */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                    <div className="card-container w-full">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">더보기</h2>
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                        <Megaphone size={20} />
                                    </div>
                                    <span className="text-slate-700 font-medium">공지사항</span>
                                </div>
                                <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                            </button>

                            <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                        <HelpCircle size={20} />
                                    </div>
                                    <span className="text-slate-700 font-medium">자주하는 질문</span>
                                </div>
                                <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                            </button>

                            <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                        <Settings size={20} />
                                    </div>
                                    <span className="text-slate-700 font-medium">설정</span>
                                </div>
                                <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                            </button>
                        </div>
                    </div>
                </section>
                {/* 추가 버튼 섹션 (회원정보수정, 로그아웃) */}
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