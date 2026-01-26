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

export default function FoodList({ foods = [], totalCalories = 0, loading =false}: FoodListProps) {
    if(loading) {
        return(
            <div className="food-container">
                <p>로딩 중...</p>
            </div>
        );
    }

    //데이터가 없으면
    if(foods.length === 0) {
        return(
            <div className="food-container">
                <div className="food-container-header">
                    <h2>오늘의 식단</h2>
                </div>
                <p style={{ color: "#888", textAlign: "center", padding: "20px 0"}}>
                    등록된 식단이 없습니다.
                </p>
            </div>
        );
    }
    //데이터가 있으면
    return (
        <div className="food-container">
            <div className="food-container-header">
                <h2>오늘의 식단</h2>
                <span className="food-total">총 {totalCalories} kcal</span>
            </div>
            
            <div className="food-list">
                {foods.map((food) => (
                    <div key={food.food_id} className="food-card">
                        <div className="food-image">
                            {food.food_image ? (
                                <img src={food.food_image} alt={food.food_name} />
                            ) : (
                                <div className="food-placeholder">🍽️</div>
                            )}
                        </div>
                        <div className="food-info">
                            <span className="food-name">{food.food_name}</span>
                            <span className="food-calories">{food.food_calories} kcal</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}