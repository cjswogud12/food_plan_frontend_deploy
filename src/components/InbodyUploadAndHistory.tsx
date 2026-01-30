"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadInbodyImage } from "@/api/index";

interface InbodyUploadProps {
  onUploadSuccess?: (data?: unknown) => void;
}

export default function InbodyUpload({ onUploadSuccess }: InbodyUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 업로드 중이면 추가 트리거 방지
    if (isUploading) {
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      // ✅ base64 변환 없이 파일을 그대로 전송
      formData.append("image", file, file.name);

      const response = await uploadInbodyImage(formData, { timeoutMs: 600000 });

      let responseData: unknown = undefined;

      if (response.ok) {
        // JSON이 아닌 응답도 대비
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          // 필요하면 텍스트로 읽기
          // const text = await response.text();
          // responseData = text;
        }

        alert("인바디 데이터가 업로드되었습니다!");
        onUploadSuccess?.(responseData);
      } else {
        // 에러 바디를 같이 보여주면 디버깅이 쉬움
        const errText = await response.text().catch(() => "");
        console.error("업로드 실패:", response.status, errText);
        alert("업로드에 실패했습니다.");
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "업로드가 지연되어 취소되었습니다. 다시 시도해주세요."
          : "업로드 중 오류가 발생했습니다.";
      console.error("업로드 오류:", err);
      alert(message);
    } finally {
      setIsUploading(false);
      // 같은 파일 재선택 가능하도록 초기화
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
      >
        <Upload size={14} />
        {isUploading ? "업로드 중.." : "업로드"}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </>
  );
}
