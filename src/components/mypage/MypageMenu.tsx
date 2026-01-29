"use client";

import { User, Target, Bell, Link } from "lucide-react";

export default function MypageMenu() {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container w-full">
                <div className="grid grid-cols-4 gap-4 text-center">
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                            <User size={24} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">내 정보</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                            <Target size={24} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">목표 설정</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                            <Bell size={24} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">알림 설정</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 group">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                            <Link size={24} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">계정 연동</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
