"use client";

interface FoodEatInfoProps {
    title: string;
}

export default function FoodEatInfo({ title }: FoodEatInfoProps) {
    return (
        <section className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">음식1이름</span> {/*food_name*/}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                            <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                <div className="font-bold text-purple-600 mb-1">칼로리</div>
                                <div>{/*recordData?.calories || '-'*/}kcal</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                <div className="font-bold text-purple-600 mb-1">탄수화물</div>
                                <div>{/*recordData?.carbs || '-'*/}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                <div className="font-bold text-purple-600 mb-1">단백질</div>
                                <div>{/*recordData?.protein || '-'*/}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                                <div className="font-bold text-purple-600 mb-1">지방</div>
                                <div>{/*recordData?.fat || '-'*/}g</div> {/*목표치 설정 변경할 데이터 (임시)*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
