"use client"
import { useState } from "react"

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    //해당 월의 첫째 날, 마지막 날
    const firstDay = new Date(year, month, 1).getDay();
    //0일요일 ~6토요일
    const lastDate = new Date(year, month +1, 0).getDate();
    //오늘
    const today = new Date();
    // 이전 달, 다음 달
    const prevMonth = () => {
        setCurrentDate(new Date(year, month -1, 1));
        setSelectedDate(null);
    };
     const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    // 날짜 클릭
    const handleDateClick = (date: number) => {
        setSelectedDate(date);
    };
    // 오늘인지 확인
    const isToday = (date: number) => {
        return today.getFullYear() === year &&
               today.getMonth() === month &&
               today.getDate() === date;
    };
     // 날짜 배열 생성
    const days = [];
    // 빈 칸 (이전 달)
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    // 날짜
    for (let date = 1; date <= lastDate; date++) {
        const isSelected = selectedDate === date;
        const isTodayDate = isToday(date);
        
        days.push(
            <div
                key={date}
                className={`calendar-day ${isSelected ? "selected" : ""} ${isTodayDate ? "today" : ""}`}
                onClick={() => handleDateClick(date)}
            >
                {date}
            </div>
        );
    }
    return (
        <div className="calendar">
            {/* 헤더 */}
            <div className="calendar-header">
                <button onClick={prevMonth}>&lt;</button>
                <span>{month + 1}월 {year}</span>
                <button onClick={nextMonth}>&gt;</button>
            </div>
            {/* 요일 */}
            <div className="calendar-weekdays">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <div key={day} className="weekday">{day}</div>
                ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="calendar-grid">
                {days}
            </div>
        </div>
    );
}