"use client"
import { useViewport } from "@/context/ViewportContext"
import { useState, useEffect } from "react"
import Link from "next/link"

interface FoodRecord {
    id: number;
    goal_calories: number;
    food_name: string;
    calories: number;
    created_at: string;
}
export default function Mypage() {
    const { isMobile } = useViewport();
    const [foodrecords, setFoodRecords] = useState<FoodRecord[]>([]);
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
            <main>
                <h1>마이페이지</h1>
                {/*api 연동 확인 시험*/}
                {foodrecords.length > 0 && (
                    <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px"}}>
                        목표: {foodrecords[0].goal_calories} kcal
                    </p>
                )}
                {/*로딩 상태*/}
                {loading && <p>로딩 중.....</p>}

                {/*에러 상태*/}
                {error && <p style={{ color: "red"}}>{error}</p>}

                {/*데이터 없음*/}
                {!loading && !error && foodrecords.length === 0 && (<p>기록이 없습니다.</p>)}

                {/*음식 기록 목록*/}
                {!loading && !error && foodrecords.map((record) => (
                    <div key={record.id}
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
                <span>{record.calories} kcal</span>
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                {record.created_at}
            </div>
        </div>
    ))}
            </main>
            <footer><Link href="/">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    메인페이지로 이동
                </button>
            </Link></footer>
        </>
    );
}