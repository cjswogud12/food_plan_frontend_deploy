"use client"
import { useState, useEffect } from "react"
import { useViewport } from "@/context/ViewportContext"
import Calendar from "@/components/Calendar"
import FoodList from "@/components/Food"


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
        <FoodList
          foods={foods}
          totalCalories={totalCalories}
          loading={loading}
        />
      </main>
    </>
  );
}
