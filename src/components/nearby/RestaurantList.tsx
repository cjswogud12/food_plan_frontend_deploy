"use client"

import { MapPin, Phone, ExternalLink } from "lucide-react"
import { Restaurant } from "@/types/definitions"


interface RestaurantListProps {
    restaurants: Restaurant[];
}

export default function RestaurantList({ restaurants }: RestaurantListProps) {
    if (restaurants.length === 0) {
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
            {restaurants.map((r, idx) => (
                <li
                    key={idx}
                    className="bg-white border border-indigo-100/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {/* 식당명 + 거리 */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-bold text-slate-800 text-sm truncate">
                                    {r.label}
                                </h3>
                                <span className="shrink-0 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {r.restaurant_id}m
                                </span>
                            </div>

                            {/* 카테고리 */}
                            <p className="text-xs text-slate-500 mb-2 truncate">
                                {r.menu_item_ids}
                            </p>

                            {/* 주소 */}
                            <div className="flex items-start gap-1.5 text-xs text-slate-500">
                                <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                                <span className="leading-relaxed">{r.location_profile_id}</span>
                            </div>

                            {/* 전화번호 */}
                            {r.nutrition_ids && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                    <Phone size={12} className="shrink-0 text-slate-400" />
                                    <span>{r.nutrition_ids}</span>
                                </div>
                            )}
                        </div>

                        {/* 카카오맵 상세보기 */}
                        {r.error && (
                            <a
                                // href={r.place_url}
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
