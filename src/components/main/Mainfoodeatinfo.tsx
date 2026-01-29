"use client";

import { Food } from "@/types/definitions";
import React from 'react';

interface MainFoodEatInfoProps {
    foods: Food[];
    totalCalories: number;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MainFoodEatInfo({ foods = [], totalCalories = 0, handleImageUpload }: MainFoodEatInfoProps) {
    // 기존 ({ handleImageUpload }: MainFoodEatInfoProps)에서 수정
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="card-container w-full">

                <h2 className="text-lg font-bold text-slate-800 mb-4">섭취 식단 정보</h2>
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


                {/* 음식 이미지 불러오기 섹션 */}
                <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
                    <label
                        htmlFor="food-camera"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#847BCB', // 활기찬 코랄 색상
                            color: 'white',
                            padding: '14px 24px',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px',
                            boxShadow: '0 4px 15px rgba(147, 48, 177, 0.4)',
                            transition: 'transform 0.2s',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}
                        // 클릭 효과
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                        onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span>추가하기</span>
                    </label>
                    <input
                        id="food-camera"
                        type="file"
                        accept="image/*"
                        capture="environment" // 모바일에서 바로 후면 카메라 실행
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />

                </div>
            </div>
        </section>
    );
}
