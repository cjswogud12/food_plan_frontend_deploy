"use client"

import { useState } from "react"
import { MapPin, ExternalLink, Utensils, Plus, Check, Loader2 } from "lucide-react"
import { Restaurant } from "@/types/definitions"
import { selectMenuItem } from "@/api/index"
import { useDietStore } from "@/store"

interface RestaurantListProps {
    restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
    const allRestaurants = restaurants.flatMap(r => r.restaurants || [])
    // menu_item_ids도 평탄화 (메뉴 ID 매칭용)
    const allMenuItemIds = restaurants.flatMap(r => r.menu_item_ids || [])

    const [openMenuIdx, setOpenMenuIdx] = useState<string | null>(null) // "shopIdx-menuIdx" 형태
    const [loadingKey, setLoadingKey] = useState<string | null>(null)
    const [doneKey, setDoneKey] = useState<string | null>(null)

    const handleSelectMeal = async (
        menuItemId: number,
        menuData: any,
        mealType: 'breakfast' | 'lunch' | 'dinner'
    ) => {
        const key = openMenuIdx
        setLoadingKey(key)
        setOpenMenuIdx(null)

        try {
            const res = await selectMenuItem(menuItemId, mealType)
            if (res.ok) {
                const { dietPlan, setDietPlan } = useDietStore.getState()
                if (dietPlan) {
                    setDietPlan({
                        ...dietPlan,
                        [mealType]: {
                            name: menuData.name,
                            food_name: menuData.name,
                            calories_kcal: menuData.nutrition?.calories_kcal || 0,
                            food_calories: menuData.nutrition?.calories_kcal || 0,
                        }
                    })
                }
                setDoneKey(key)
                setTimeout(() => setDoneKey(null), 2000)
            }
        } catch (err) {
            console.error("메뉴 선택 실패:", err)
        } finally {
            setLoadingKey(null)
        }
    }

    if (allRestaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <MapPin size={48} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium">주변에 검색된 식당이 없습니다</p>
                <p className="text-xs mt-1">검색 반경을 확인해주세요</p>
            </div>
        )
    }

    // menu_item_ids에서 메뉴 ID를 순서대로 매칭하기 위한 카운터
    let menuIdCounter = 0

    return (
        <ul className="space-y-3">
            {allRestaurants.map((shop, shopIdx) => (
                <li
                    key={shopIdx}
                    className="bg-white border border-indigo-100/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {/* 식당명 + 거리 */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-bold text-slate-800 text-sm truncate">
                                    {shop.name}
                                </h3>
                                <span className="shrink-0 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {shop.distance_m}m
                                </span>
                            </div>

                            {/* 주소 */}
                            <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-2">
                                <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                                <span className="leading-relaxed">{shop.address_text}</span>
                            </div>

                            {/* 메뉴 리스트 */}
                            {shop.menus && shop.menus.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {shop.menus.map((menu, mIdx) => {
                                        const currentMenuId = allMenuItemIds[menuIdCounter] || 0
                                        menuIdCounter++
                                        const key = `${shopIdx}-${mIdx}`
                                        const isOpen = openMenuIdx === key
                                        const isLoading = loadingKey === key
                                        const isDone = doneKey === key

                                        return (
                                            <div key={mIdx} className="relative">
                                                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Utensils size={10} className="text-slate-400" />
                                                        <span className="font-medium text-slate-700">{menu.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">{menu.price}원</span>
                                                        <span className="text-indigo-600 font-semibold">
                                                            {menu.nutrition?.calories_kcal}kcal
                                                        </span>
                                                        {/* 선택 버튼 */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setOpenMenuIdx(isOpen ? null : key)
                                                            }}
                                                            disabled={isLoading}
                                                            className="ml-1 p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors"
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 size={12} className="animate-spin text-indigo-500" />
                                                            ) : isDone ? (
                                                                <Check size={12} className="text-green-500" />
                                                            ) : (
                                                                <Plus size={12} className="text-indigo-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* 끼니 선택 팝오버 */}
                                                {isOpen && (
                                                    <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-indigo-100 rounded-xl shadow-lg p-1 flex gap-1">
                                                        {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleSelectMeal(currentMenuId, menu, type)}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-indigo-50 transition-colors text-slate-700"
                                                            >
                                                                {type === 'breakfast' ? '아침' : type === 'lunch' ? '점심' : '저녁'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 카카오맵 상세보기 */}
                        {shop.place_url && (
                            <a
                                href={shop.place_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            >
                                <ExternalLink size={16} className="text-indigo-500" />
                            </a>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    )
}
