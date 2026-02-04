"use client";

import { useState } from "react";

interface CalendarFullProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    recordedDays?: string[]; // "YYYY-MM-DD" format
    onMonthChange?: (date: Date) => void;
}

export default function CalendarFull({ selectedDate, onDateSelect, recordedDays = [], onMonthChange }: CalendarFullProps) {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(selectedDate));

    // 월 계산
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const updateMonth = (newDate: Date) => {
        setCurrentMonthDate(newDate);
        onMonthChange?.(newDate);
    };

    const prevMonth = () => updateMonth(new Date(year, month - 1, 1));
    const nextMonth = () => updateMonth(new Date(year, month + 1, 1));

    // 해당 월의 첫 날과 마지막 날 계산
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0);

    // 달력 시작일 (첫 주의 일요일)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - startDate.getDay());

    // 달력 종료일 (마지막 주의 토요일)
    const endDate = new Date(lastDateOfMonth);
    endDate.setDate(lastDateOfMonth.getDate() + (6 - lastDateOfMonth.getDay()));

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    const formatHeaderDate = (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

    return (
        <div className="w-full bg-white p-4 rounded-2xl shadow-sm border-2 border-indigo-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-indigo-600">&lt;</button>
                <span
                    onClick={() => window.location.href = '/'}
                    className="font-bold text-lg text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                    {formatHeaderDate(currentMonthDate)}</span>
                <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-indigo-600">&gt;</button>
            </div>


            {/* <div className=""> */}
            {/* 헤더 (년 월 및 이전/다음 주 이동) */}
            {/* <div className="calendar-header flex justify-between items-center mb-4 px-2">
                <button onClick={prevWeek} className="p-2 text-slate-500 hover:text-indigo-600">&lt;</button>
                <span
                    onClick={() => window.location.href = '/calender_particular'}
                    className="font-bold text-lg text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                    {formatHeaderDate(weekDays[0])}
                </span>
                <button onClick={nextWeek} className="p-2 text-slate-500 hover:text-indigo-600">&gt;</button>
            </div> */}

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                    <div key={i} className={`text-xs font-semibold ${i === 0 ? "text-red-500" : "text-slate-500"}`}>{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-4 text-center">
                {days.map((d, i) => {
                    const offsetDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
                    const dateStr = offsetDate.toISOString().split('T')[0];
                    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                    const isCurrentMonth = d.getMonth() === month;
                    const isToday = dateStr === todayStr;
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const hasRecord = recordedDays.includes(dateStr);

                    // 과거 여부 판단 (오늘 이전)
                    const isPast = dateStr < todayStr;
                    // 기록 누락 여부 로직 삭제됨

                    return (
                        <div key={i} className="flex flex-col items-center" onClick={() => onDateSelect(d)}>
                            <span
                                className={`
                                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-all
                                    ${!isCurrentMonth ? "text-slate-300" : "text-slate-700 hover:bg-slate-100"}
                                    ${isSelected
                                        ? "bg-indigo-400 text-white shadow-md"
                                        : isCurrentMonth && hasRecord
                                            ? "bg-indigo-100 text-indigo-600 font-bold"
                                            : ""
                                    }
                                    ${isToday && !isSelected && !hasRecord ? "border border-indigo-200 text-indigo-600" : ""}
                                `}
                            >
                                {d.getDate()}
                            </span>

                            {/* Status Dots Removed */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
