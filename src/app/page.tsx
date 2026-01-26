"use client"
import { useState, useEffect } from "react"
import { useViewport } from "@/context/ViewportContext"


export default function Mainpage() {
  const { isMobile } = useViewport();

  return (
    <>
      <header>
        <span style={{ marginLeft: '12px' }}>{isMobile ? '모바일' : 'PC'}</span>
      </header>
      <main>
        <h1>Main Page</h1>
        <p>메인 페이지 콘텐츠 영역입니다.</p>
      </main>
    </>
  );
}
