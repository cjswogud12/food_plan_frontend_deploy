"use client"
import FoodList from "@/components/Main_Food"

interface MainTodayLikeFoodProps {
    foods: any[];
    totalCalories: number;
    loading: boolean;
}

export default function MainTodayLikeFood({ foods, totalCalories, loading }: MainTodayLikeFoodProps) {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800 mb-4">오늘의 추천 식단</h2>

                <FoodList
                    foods={foods}
                    totalCalories={totalCalories}
                    loading={loading}
                />
            </div>
        </section>
    );
}
