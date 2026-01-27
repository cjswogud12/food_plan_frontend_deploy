"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { uploadInbodyImage } from "@/api/inbody"

interface InbodyUploadProps {
    onUploadSuccess?: () => void;
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
            // 파일을 base64로 변환
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                const blob = base64ToBlob(base64);
                const formData = new FormData();
                formData.append('image', blob, `inbody_${Date.now()}.jpg`);

                // 백엔드로 전송
                const response = await uploadInbodyImage(formData);

                if (response.ok) {
                    alert("인바디 데이터가 업로드되었습니다!");
                    onUploadSuccess?.();
                } else {
                    alert("업로드에 실패했습니다.");
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("업로드 오류:", err);
            alert("업로드 중 오류가 발생했습니다.");
            setIsUploading(false);
        }

        // 같은 파일 다시 선택 가능하도록
        e.target.value = '';
    };

    return (
        <>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
                <Upload size={14} />
                {isUploading ? "업로드 중..." : "업로드"}
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
