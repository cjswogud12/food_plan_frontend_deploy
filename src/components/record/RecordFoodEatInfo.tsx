"use client";

interface FoodEatInfoProps {
    title: string;
}

export default function FoodEatInfo({ title }: FoodEatInfoProps) {
    return (
        <section className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <div className="text-sm text-slate-500">
                    상세 식단 정보가 여기에 표시됩니다.
                </div>
            </div>
        </section>
    );
}
