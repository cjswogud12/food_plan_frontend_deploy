"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Plus, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AiChatbot from "@/components/AiChatBot/Aichatbot"
import { uploadInbodyImage, uploadFoodImage } from "@/api/index";

interface FloatingCameraButtonProps {
    onUploadSuccess?: (data?: unknown) => void;
}

export default function FloatingCameraButton({ onUploadSuccess }: FloatingCameraButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraMode, setCameraMode] = useState<'inbody' | 'food'>('food');
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [showMealOptions, setShowMealOptions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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

    // 촬영 후 처리 (백엔드 전송)
    const handleSubmit = async () => {
        if (!capturedImage) return;

        setIsProcessing(true);

        try {
            // FormData 생성
            const blob = base64ToBlob(capturedImage);
            const formData = new FormData();
            formData.append('image', blob, `photo_${Date.now()}.jpg`);

            // 음식 모드일 때 meal_type 추가 (user_number는 백엔드 세션에서 처리)
            if (cameraMode === 'food') {
                formData.append('meal_type', mealType);
            }

            // 모드에 따라 다른 API 호출
            const response = cameraMode === 'inbody'
                ? await uploadInbodyImage(formData)
                : await uploadFoodImage(formData);
            let responseData: unknown = undefined;
            const success = response.ok;

            if (success) {
                try {
                    responseData = await response.json();
                } catch {
                    // Ignore JSON parse errors for non-JSON responses
                }
                alert(cameraMode === 'inbody' ? "인바디 이미지가 업로드되었습니다!" : "음식 이미지가 업로드되었습니다!");
                onUploadSuccess?.(responseData);
                closeCamera();
            } else {
                alert("업로드에 실패했습니다.");
            }
        } catch (err) {
            const message = err instanceof DOMException && err.name === "AbortError"
                ? "업로드가 지연되어 취소되었습니다. 다시 시도해주세요."
                : "처리 중 오류가 발생했습니다.";
            alert(message);
        } finally {
            setIsProcessing(false);
        }
    };


    // 카메라 시작
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("카메라 접근 실패:", error);
            alert("카메라에 접근할 수 없습니다.");
            setShowCamera(false);
        }
    };

    // 카메라 종료
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // 사진 촬영
    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageData);
                stopCamera();
            }
        }
    };

    // 카메라 모달 열기
    const openCamera = () => {
        setShowCamera(true);
        setCapturedImage(null);
        setIsOpen(false);
    };

    // 챗봇 모달 열기/닫기
    const openChatbot = () => {
        setShowChatbot(true);
        setIsOpen(false);
    };

    const closeChatbot = () => {
        setShowChatbot(false);
    };

    // 카메라 모달 닫기
    const closeCamera = () => {
        stopCamera();
        setShowCamera(false);
        setCapturedImage(null);
    };

    // 다시 촬영
    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    // 모달이 열리면 카메라 시작
    useEffect(() => {
        if (showCamera && !capturedImage) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [showCamera, capturedImage]);

    return (
        <>
            {/* FAB 컨테이너 */}
            <div className="absolute bottom-24 right-4 flex flex-col items-center gap-3 z-50">
                {/* 확장 버튼 (챗봇) */}
                <button
                    onClick={openChatbot}
                    className={`w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-purple-600 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                >
                    <MessageCircle size={24} />
                </button>

                {/* 확장 버튼 (카메라) */}
                <button
                    onClick={openCamera}
                    className={`w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-purple-600 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                >
                    <Camera size={24} />
                </button>

                {/* 메인 FAB 버튼 (+) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-purple-700 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* 카메라 모달 */}
            {showCamera && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    {/* 헤더 */}
                    <div className="flex justify-between items-center p-4 bg-black/50">
                        <span className="text-white font-medium">사진 촬영</span>
                        <button
                            onClick={closeCamera}
                            className="text-white p-2 hover:bg-white/20 rounded-full"
                        >
                            <X size={24} />
                        </button>
                        {/* 모드 선택 탭 */}
                        <div className="flex justify-center items-center gap-2 p-3">
                            <Button
                                onClick={() => {
                                    setCameraMode('inbody');
                                    setShowMealOptions(false);
                                }}
                                variant="ghost"
                                size="sm"
                                className={`rounded-full ${cameraMode === 'inbody'
                                    ? 'bg-white text-black hover:bg-white/90'
                                    : 'bg-white/20 text-white/70 hover:bg-white/30'}`}
                            >
                                인바디
                            </Button>

                            {/* 음식 기록 버튼 - FAB 스타일 */}
                            <div className="relative">
                                <Button
                                    onClick={() => {
                                        setCameraMode('food');
                                        setShowMealOptions(!showMealOptions);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-full ${cameraMode === 'food'
                                        ? 'bg-white text-black hover:bg-white/90'
                                        : 'bg-white/20 text-white/70 hover:bg-white/30'}`}
                                >
                                    음식 기록
                                </Button>

                                {/* FAB 서브메뉴 - 아래로 펼쳐짐 */}
                                {showMealOptions && cameraMode === 'food' && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col gap-2 z-50">
                                        {[
                                            { key: 'breakfast', label: '아침' },
                                            { key: 'lunch', label: '점심' },
                                            { key: 'dinner', label: '저녁' },
                                            { key: 'snack', label: '간식' }
                                        ].map(({ key, label }, index) => (
                                            <Button
                                                key={key}
                                                onClick={() => {
                                                    setMealType(key as typeof mealType);
                                                    setShowMealOptions(false);
                                                }}
                                                variant="ghost"
                                                size="xs"
                                                className={`rounded-full whitespace-nowrap transition-all duration-200 ${mealType === key
                                                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                                                    : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                                style={{
                                                    animation: `fadeInUp 0.2s ease-out ${index * 0.05}s both`
                                                }}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 비디오/이미지 영역 */}
                    <div className="flex-1 relative">
                        {capturedImage ? (
                            <img
                                src={capturedImage}
                                alt="촬영한 사진"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* 컨트롤 버튼 */}
                    <div className="p-6 bg-black/50 flex justify-center gap-8">
                        {capturedImage ? (
                            <>
                                <button
                                    onClick={retakePhoto}
                                    disabled={isProcessing}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 disabled:opacity-50"
                                >
                                    다시 촬영
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {isProcessing ? "처리 중.." : "사용하기"}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={takePhoto}
                                className="w-16 h-16 bg-white rounded-full border-4 border-purple-500 hover:scale-105 transition-transform"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 챗봇 팝업 모달 */}
            {showChatbot && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                        {/* 팝업 헤더 */}
                        <div className="flex justify-end p-2 bg-gray-100">
                            <button
                                onClick={closeChatbot}
                                className="p-2 hover:bg-gray-200 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        {/* 챗봇 컴포넌트 */}
                        <div className="flex-1 overflow-hidden">
                            <AiChatbot />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}


