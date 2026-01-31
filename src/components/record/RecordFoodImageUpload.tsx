"use client"

import { useRef, useState } from "react"
import { uploadFoodImage } from "@/api/index"

interface FoodImageUploadProps {
    mealType: string;  // breakfast, lunch, dinner, snack
    onUploadSuccess?: (data?: unknown) => void;
    onClose?: () => void;
}

export default function FoodImageUpload({ mealType, onUploadSuccess, onClose }: FoodImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('meal_type', mealType);

            // user_number가 필요하면 추가
            // user_number가 필요하면 추가
            const userNumber = localStorage.getItem("user_number");
            if (userNumber) {
                formData.append('user_number', userNumber);
            }

            // FormData 확인을 위한 로그 추가
            for (const pair of formData.entries()) {
                console.log(`FormData: ${pair[0]}, ${pair[1]}`);
            }

            const response = await uploadFoodImage(formData);

            if (response.ok) {
                const data = await response.json();
                alert("음식 이미지가 업로드되었습니다!");
                onUploadSuccess?.(data);
            } else {
                const errText = await response.text();
                console.error("업로드 실패 상세:", response.status, errText);
                alert(`업로드에 실패했습니다. (Error: ${response.status}) \n${errText}`);
            }
        } catch (err: any) {
            console.error("업로드 오류:", err);
            alert(`업로드 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
        />
    );
}