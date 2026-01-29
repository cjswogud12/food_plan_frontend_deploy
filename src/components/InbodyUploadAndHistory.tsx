"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { uploadInbodyImage } from "@/api/index"

interface InbodyUploadProps {
    onUploadSuccess?: (data?: unknown) => void;
}

export default function InbodyUpload({ onUploadSuccess }: InbodyUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Base64를 Blob으로 변환
    const base64ToBlob = (base64: string): Blob => {
        const parts = base64.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(parts[1]);
        const arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            arr[i] = bstr.charCodeAt(i);
        }
        return new Blob([arr], { type: mime });
    };

    // 파일 선택 핸들러
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);


        try {
            // 파일을 base64로 변환 (Promise로 래핑)
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("파일 읽기 실패"));
                reader.readAsDataURL(file);
            });

            const blob = base64ToBlob(base64);
            const formData = new FormData();
            formData.append('image', blob, `inbody_${Date.now()}.jpg`);

            // 백엔드로 전송
            const response = await uploadInbodyImage(formData);

            let responseData: unknown = undefined;

            if (response.ok) {
                try {
                    responseData = await response.json();
                } catch {
                    // Ignore JSON parse errors for non-JSON responses
                }
                alert("인바디 데이터가 업로드되었습니다!");
                onUploadSuccess?.(responseData);
            } else {
                alert("업로드에 실패했습니다.");
            }
        } catch (err) {
            const message = err instanceof DOMException && err.name === "AbortError"
                ? "업로드가 지연되어 취소되었습니다. 다시 시도해주세요."
                : "업로드 중 오류가 발생했습니다.";
            console.error("업로드 오류:", err);
            alert(message);
        } finally {
            setIsUploading(false);
            // 같은 파일 재선택 가능하도록 초기화
            e.target.value = '';
        }
    };

    return (
        <>
            <button
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


