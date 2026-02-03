"use client";

import { Megaphone, HelpCircle, Settings, ChevronRight } from "lucide-react";

export default function MypageMenuSeeMore() {
    return (
        <section className="bg-gradient-to-br from-sky-200 via-pink-200 to-yellow-200 rounded-2xl p-5 shadow-sm border border-white/50 mb-4">
            <div className="card-container w-full">
                <h2 className="text-lg font-bold text-slate-800 mb-4">더보기</h2>
                <div className="flex flex-col gap-2">
                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white rounded-lg group-hover:opacity-90 transition-opacity">
                                <Megaphone size={20} />
                            </div>
                            <span className="text-slate-700 font-medium">공지사항</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                    </button>

                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white rounded-lg group-hover:opacity-90 transition-opacity">
                                <HelpCircle size={20} />
                            </div>
                            <span className="text-slate-700 font-medium">자주하는 질문</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                    </button>

                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white rounded-lg group-hover:opacity-90 transition-opacity">
                                <Settings size={20} />
                            </div>
                            <span className="text-slate-700 font-medium">설정</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                    </button>
                </div>
            </div>
        </section>
    );
}
