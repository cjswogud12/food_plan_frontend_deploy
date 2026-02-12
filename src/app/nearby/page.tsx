"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search, Loader2, Navigation } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { fetchNearbyRestaurants } from "@/api/index"
import RestaurantList from "@/components/nearby/RestaurantList"

export default function NearbyPage() {
    const router = useRouter()
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)
    const [gpsLoading, setGpsLoading] = useState(true)
    const [gpsError, setGpsError] = useState<string | null>(null)

    const [restaurants, setRestaurants] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searched, setSearched] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)

    // GPS 위치 자동 획득 & 로그인 체크
    useEffect(() => {
        // 1. Supabase 세션 확인
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }
        }
        checkSession()

        // 2. GPS 위치 확인

        if (!navigator.geolocation) {
            setGpsError("이 브라우저에서는 위치 서비스를 사용할 수 없습니다.")
            setGpsLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude)
                setLng(pos.coords.longitude)
                setGpsLoading(false)
            },
            (err) => {
                console.error("GPS error:", err)
                setGpsError("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.")
                setGpsLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [router])

    // 식당 검색
    const handleSearch = async () => {
        if (lat === null || lng === null) return

        setIsSearching(true)
        setSearchError(null)
        setSearched(true)

        try {
            const res = await fetchNearbyRestaurants("현재 위치", lat, lng, 500)
            if (!res.ok) {
                const errText = await res.text()
                throw new Error(`서버 오류: ${res.status} ${errText}`)
            }
            const data = await res.json()
            // 백엔드 NodeRunResponse: { restaurant_ids, menu_item_ids, nutrition_ids, ... }
            if (data.restaurant_ids && data.restaurant_ids.length > 0) {
                setRestaurants([data])
            } else {
                setRestaurants([])
            }
        } catch (err: any) {
            console.error("식당 검색 실패:", err)
            setSearchError(err.message || "식당 검색에 실패했습니다.")
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
            {/* Header */}
            <header className="px-4 pt-6 pb-3">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    <span className="text-indigo-600">주변 식당</span> 검색
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    현재 위치 반경 500m 내 식당을 검색합니다
                </p>
            </header>

            <div className="px-4 space-y-4 pb-20">
                {/* GPS 상태 카드 */}
                <section className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-4 shadow-sm border border-indigo-100/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2.5 rounded-full">
                            <Navigation size={18} className="text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-700">현재 위치</h3>
                            {gpsLoading ? (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Loader2 size={12} className="animate-spin" />
                                    위치를 가져오는 중...
                                </p>
                            ) : gpsError ? (
                                <p className="text-xs text-red-500 mt-0.5">{gpsError}</p>
                            ) : (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    위도 {lat?.toFixed(4)}, 경도 {lng?.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 검색 버튼 */}
                <button
                    onClick={handleSearch}
                    disabled={gpsLoading || !!gpsError || isSearching}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm
                        ${gpsLoading || !!gpsError || isSearching
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]"
                        }`}
                >
                    {isSearching ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            검색 중...
                        </>
                    ) : (
                        <>
                            <Search size={16} />
                            주변 식당 검색
                        </>
                    )}
                </button>

                {/* 에러 표시 */}
                {searchError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                        {searchError}
                    </div>
                )}

                {/* 검색 결과 */}
                {searched && !isSearching && !searchError && (
                    <section>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="font-bold text-slate-800 text-sm">
                                검색 결과
                            </h2>
                            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                                {restaurants.length}개
                            </span>
                        </div>
                        <RestaurantList restaurants={restaurants} />
                    </section>
                )}
            </div>
        </div>
    )
}
