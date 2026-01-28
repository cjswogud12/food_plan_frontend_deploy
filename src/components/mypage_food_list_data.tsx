"use client";
import { Record } from "@/types/record";

interface FoodListDataProps {
    loading: boolean;
    error: string | null;
    foodrecords: Record[];
}

export default function FoodListData({ loading, error, foodrecords }: FoodListDataProps) {
    return (
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
    );
}
