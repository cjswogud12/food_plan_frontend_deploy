"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import { X, MapPin, Navigation } from "lucide-react";
import { DietPlanKakaoMap } from "@/types/definitions";

interface DietMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DietPlanKakaoMap | null;
}

export default function DietMapModal({ isOpen, onClose, data }: DietMapModalProps) {
    const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

    // ESC key close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col md:flex-row shadow-2xl overflow-hidden relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-white shadow-sm transition-all text-slate-500 hover:text-slate-800"
                >
                    <X size={20} />
                </button>

                {/* Left Panel: Place List */}
                <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col h-1/3 md:h-full">
                    <div className="p-5 border-b border-slate-100 bg-white">
                        <h2 className="text-xl font-bold text-slate-800 mb-1">
                            {data.food_name}
                        </h2>
                        <p className="text-sm text-slate-500">
                            주변 추천 식당 {data.place.length}곳
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {data.place.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => setSelectedPlace(place.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPlace === place.id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold ${selectedPlace === place.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {place.name}
                                    </h3>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                        {place.category_group_name || "식당"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-2 truncate">
                                    {place.road_address_name || place.address_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    {place.phone && (
                                        <span className="text-indigo-500 flex items-center gap-0.5">
                                            📞 {place.phone}
                                        </span>
                                    )}
                                    <span className="text-slate-400">
                                        {place.distance_m || 0}m
                                    </span>
                                </div>
                                {place.place_url && (
                                    <a
                                        href={place.place_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 block text-center w-full py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        상세보기
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Map */}
                <div className="w-full md:w-2/3 h-2/3 md:h-full bg-slate-200 relative">
                    <Map
                        center={{ lat: data.lat, lng: data.lng }}
                        style={{ width: "100%", height: "100%" }}
                        level={4}
                        onCreate={(map) => {
                            console.log("✅ Kakao Map Created:", map);
                            // 지도 크기 재설정이 필요한 경우를 위해
                            map.relayout();
                        }}
                    >
                        {/* User Location Marker */}
                        <MapMarker
                            position={{ lat: data.lat, lng: data.lng }}
                            image={{
                                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                                size: { width: 40, height: 42 },
                                options: { offset: { x: 20, y: 42 } },
                            }}
                        />

                        {/* Place Markers */}
                        {data.place.map((place) => (
                            <MapMarker
                                key={place.id}
                                position={{ lat: parseFloat(place.y.toString()), lng: parseFloat(place.x.toString()) }}
                                onClick={() => setSelectedPlace(place.id)}
                                image={{
                                    src: selectedPlace === place.id
                                        ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                                        : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png",
                                    size: { width: 24, height: 35 },
                                }}
                            >
                                {selectedPlace === place.id && (
                                    <div className="p-2 min-w-[150px] text-center">
                                        <div className="font-bold text-sm mb-1">{place.name}</div>
                                        <div className="text-xs text-slate-500">{place.phone}</div>
                                        <a
                                            href={`https://map.kakao.com/link/to/${place.id},${place.y},${place.x}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-500 hover:underline block mt-1"
                                        >
                                            길찾기
                                        </a>
                                    </div>
                                )}
                            </MapMarker>
                        ))}
                    </Map>
                </div>
            </div>
        </div>
    );
}
