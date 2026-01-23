"use client"
import Image from "next/image";
import { useState, useEffect } from "react"
import { Menu, Bell, Home, User } from "lucide-react"
import { useViewport } from "@/context/ViewportContext"
import Link from "next/link"

export default function Mainpage() {
  const { isMobile } = useViewport();

  return (
    <>
      <header>
        <Menu size={24} />
        <span style={{ marginLeft: '12px' }}>{isMobile ? '모바일' : 'PC'}</span>
      </header>
      <main>
        <h1>Main Page</h1>
        <p>메인 페이지 콘텐츠 영역입니다.</p>
      </main>
      <footer> <Link href="/mypage">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            마이페이지로 이동
          </button>
        </Link></footer>
    </>
  );
}
