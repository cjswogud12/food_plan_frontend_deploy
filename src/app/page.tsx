"use client"
import { useState, useEffect } from "react"
import { useViewport } from "@/context/ViewportContext"
import Calendar from "@/components/Calendar"
import FoodList from "@/components/Food"
import FloatingCameraButton from "@/components/FloatingCameraButton"

export default function Mainpage() {
  const { isMobile } = useViewport();
  const [ foods, setFoods ] = useState([]);
  const [ totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading ] = useState(true);

  return (
    <>
      <header>
        <span style={{ marginLeft: '12px' }}>{isMobile ? '모바일' : 'PC'}</span>
      </header>
      <main>
        <Calendar />
        <section>
          <FoodList
          foods={foods}
          totalCalories={totalCalories}
          loading={loading}
        />
        </section>
        <FloatingCameraButton/>
      </main>
    </>
  );
}
