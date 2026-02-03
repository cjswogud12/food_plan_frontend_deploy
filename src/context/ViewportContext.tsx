/*
반응형 웹앱 서비스를 위한 tsx파일
해당 코드를 전역으로 변경
*/

"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

//context 생성
const ViewportContext = createContext({ isMobile: false });

//Provider 컴포넌트
export function ViewportProvider({ children }: { children: ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        // 초기값 설정
        setIsMobile(mediaQuery.matches);

        // 변경 감지 핸들러
        const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return (
        <ViewportContext.Provider value={{ isMobile }}>
            {children}
        </ViewportContext.Provider>
    );
}

// 커스텀 hook (다른 컴포넌트에서 사용할때 useViewport 호출)

export function useViewport() {
    return useContext(ViewportContext);
}