"use client"
import InbodyUpload from '@/components/InbodyUpload'
// import { User } from '@/types/user' // 필요시 활성화
// import { Record } from '@/types/record' // 필요시 활성화

interface MypageBodyCompositionProps {
    // userData?: User | null;
    // recordData?: Record | null;
}

export default function MypageBodyComposition({ }: MypageBodyCompositionProps) {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="card-container">
                <h2 className="text-lg font-bold text-slate-800">체성분</h2>
                <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">체중</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {/*userData?.weight || '0'*/} <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">신장</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {/*recordData?.fatRate || '0'*/} <span className="text-sm font-normal text-slate-500">cm</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">골격근량</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {/*userData?.muscle || '0'*/}
                            <span className="text-sm font-normal text-slate-500">kg</span>
                        </span>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-slate-500 mb-1">체지방률</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {/*recordData?.fatRate || '0'*/} <span className="text-sm font-normal text-slate-500">%</span>
                        </span>
                    </div>
                </div>
                <InbodyUpload />
            </div>
        </section>
    );
}
