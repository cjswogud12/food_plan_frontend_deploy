"use client";

import { Megaphone, HelpCircle, Settings, ChevronRight } from "lucide-react";

export default function MypageMenuSeeMore() {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="card-container w-full">
                <h2 className="text-lg font-bold text-slate-800 mb-4">더보기</h2>
                <div className="flex flex-col gap-2">
                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <Megaphone size={20} />
                            </div>
                            <span className="text-slate-700 font-medium">공지사항</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                    </button>

                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <HelpCircle size={20} />
                            </div>
                            <span className="text-slate-700 font-medium">자주하는 질문</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-purple-500" />
                    </button>

                    <button className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
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
