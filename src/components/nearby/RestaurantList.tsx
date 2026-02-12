"use client"

import { MapPin, ExternalLink, Utensils } from "lucide-react"
import { Restaurant } from "@/types/definitions"

interface RestaurantListProps {
    restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
    // 모든 Restaurant 객체에서 restaurants 배열을 꺼내서 평탄화
    const allRestaurants = restaurants.flatMap(r => r.restaurants || [])

    if (allRestaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <MapPin size={48} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium">주변에 검색된 식당이 없습니다</p>
                <p className="text-xs mt-1">검색 반경을 확인해주세요</p>
            </div>
        )
    }

    return (
        <ul className="space-y-3">
            {allRestaurants.map((shop, idx) => (
                <li
                    key={idx}
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
                                    {shop.menus.map((menu, mIdx) => (
                                        <div key={mIdx} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-1.5">
                                                <Utensils size={10} className="text-slate-400" />
                                                <span className="font-medium text-slate-700">{menu.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">{menu.price}</span>
                                                <span className="text-indigo-600 font-semibold">
                                                    {menu.nutrition?.calories_kcal}kcal
                                                </span>
                                            </div>
                                        </div>
                                    ))}
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
