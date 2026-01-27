"use client"
import { Food } from "@/types/food"

//백엔드에서 받아올 데이터 타입 정리

interface FoodListProps {
    foods?: Food[];
    totalCalories?: number;
    totalProteins?: number;
    totalCarbs?: number;
    totalFats?: number;
    loading?: boolean;
}

export default function FoodList({ foods = [], totalCalories = 0, loading = false }: FoodListProps) {
    // 처음 데이터를 불러올 때만 전체 로딩 화면 (데이터가 없을 때만)
    if (loading && foods.length === 0) {
        return (
            <div className="food-container">
                <p>로딩 중...</p>
            </div>
        );
    }

    //데이터가 없으면
    if (foods.length === 0) {
        return (
            <div className="food-container">
                <div className="food-container-header">
                    <h2>오늘의 식단</h2>
                </div>
                <p style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>
                    등록된 식단이 없습니다.
                </p>
            </div>
        );
    }
    //데이터가 있으면
    return (
        <div className="food-container">
            {/* 추가 데이터 로딩 중일 때 표시 */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                    🍽️ 음식 분석 중...
                </div>
            )}
        </div>
    );
}