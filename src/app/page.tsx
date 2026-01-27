"use client"
import { useState, useEffect } from "react"
import { useViewport } from "@/context/ViewportContext"
import Calendar from "@/components/Main_Calendar"
import MainTodayLikeFood from "@/components/main_today_like_food"
import MainFoodEatInfo from "@/components/main_food_eat_info"
import FloatingCameraButton from "@/components/FloatingCameraButton"
// import { getRandomFood } from "@/components/main_food_dummy_data"

export default function Mainpage() {
  const { isMobile } = useViewport();
  const [foods, setFoods] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // 사진 업로드 핸들러 (백엔드 연동 틀)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 동작 확인을 위한 더미 데이터
      console.log("이미지 전송(임시):", file.name);
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 대기

      // 테스트용 더미 데이터 (백엔드 연동시 삭제)
      /*
      const randomFood = getRandomFood();

      const mockData = {
        food_id: Date.now(),
        food_name: `[테스트] ${randomFood.name}`,
        food_calories: randomFood.calories,
        food_proteins: 0,
        food_carbs: 0,
        food_fats: 0,
        // food_image: URL.createObjectURL(file) // 필요 시 이미지 미리보기 URL 사용
      };

      // 상태 업데이트
      setFoods((prev: any) => [...prev, mockData]);
      setTotalCalories((prev) => prev + mockData.food_calories);
      */

      alert(`'${file.name}' 음식 이미지가 업로드 되었습니다!`);

    } catch (error) {
      console.error("Upload Error:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      // 포커스 문제 방지 등을 위해 input 초기화가 필요하다면 여기서 처리
      e.target.value = '';
    }
  };

  return (
    <>
      <header>
        <span style={{ marginLeft: '12px' }}>{isMobile ? '모바일' : 'PC'}</span>
      </header>
      <main>
        {/* 달력 (Calendar) */}
        <Calendar />
        {/* 오늘의 추천 식단 (main_food_eat_info) */}
        <MainTodayLikeFood foods={foods} totalCalories={totalCalories} loading={loading} />
        {/* 섭취 식단 정보 (main_food_eat_info) */}
        <MainFoodEatInfo
          foods={foods}
          totalCalories={totalCalories}
          handleImageUpload={handleImageUpload}
        />
        {/* -- */}
        <FloatingCameraButton/>
      </main>
    </>
  );
}
