
"use client"
import { useState, useEffect } from "react"

interface CalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    // Initialize week start based on selectedDate
    useEffect(() => {
        const start = new Date(selectedDate);
        start.setDate(selectedDate.getDate() - selectedDate.getDay()); // Sunday
        setCurrentWeekStart(start);
    }, [selectedDate]);

    // Calculate Week Days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(currentWeekStart.getDate() + i);
        weekDays.push(day);
    }

    const prevWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newStart);
    };

    const nextWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newStart);
    };

    const formatHeaderDate = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

    return (
        <div className="calendar mb-4">
            {/* Header (Year Month and Prev/Next Week Navigation) */}
            <div className="calendar-header flex justify-between items-center mb-4 px-2">
                <button onClick={prevWeek} className="p-2 text-slate-500 hover:text-purple-600">&lt;</button>
                <span
                    onClick={() => window.location.href = '/calender_particular'}
                    className="font-bold text-lg text-slate-800 cursor-pointer hover:text-purple-600 transition-colors"
                >
                    {formatHeaderDate(weekDays[0])}
                </span>
                <button onClick={nextWeek} className="p-2 text-slate-500 hover:text-purple-600">&gt;</button>
            </div>

            {/* Weekday and Date Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day Header */}
                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div key={i} className={`text-xs mb-2 ${i === 0 ? "text-red-500" : "text-slate-500"}`}>{d}</div>
                ))}

                {/* Dates */}
                {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();

                    return (
                        <div key={i} className="flex flex-col items-center">
                            <button
                                onClick={() => onDateSelect(d)}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                    ${isSelected ? "bg-purple-600 text-white shadow-md scale-105" : "text-slate-700 hover:bg-slate-100"}
                                    ${isToday && !isSelected ? "border border-purple-200 text-purple-600" : ""}
                                `}
                            >
                                {d.getDate()}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}