"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { adjustDietPlanContext } from "@/api/index"
import { DietContextResponse } from "@/types/definitions"
import { useUserStore } from "@/store"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface MealChatSheetProps {
    isOpen: boolean
    onClose: () => void
    mealType: 'breakfast' | 'lunch' | 'dinner'
    mealTitle: string
    onDietUpdate: (newItems: any[]) => void
}

export function MealChatSheet({
    isOpen,
    onClose,
    mealType,
    mealTitle,
    onDietUpdate
}: MealChatSheetProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        try {
            // 사용자 목표 칼로리 가져오기 (없으면 기본값 2000)
            const userGoal = useUserStore.getState().userGoal
            const targetCalorie = userGoal?.target_calorie || 2000

            // API 호출
            const response = await adjustDietPlanContext(userMessage, targetCalorie)

            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`)
            }

            const data: DietContextResponse = await response.json()

            // AI 응답 메시지 구성
            const todayPlan = data.plan.days[0] // 오늘 식단
            const assistantMessage = `"${userMessage}" 상황을 고려해서 ${mealTitle} 식단을 조정했어요!

🍳 아침: ${todayPlan?.breakfast?.name || '-'} (${todayPlan?.breakfast?.calories_kcal || 0}kcal)
🍜 점심: ${todayPlan?.lunch?.name || '-'} (${todayPlan?.lunch?.calories_kcal || 0}kcal)
🍝 저녁: ${todayPlan?.dinner?.name || '-'} (${todayPlan?.dinner?.calories_kcal || 0}kcal)

📊 총 ${todayPlan?.total_calories_kcal || 0}kcal`

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])

            // 식단 업데이트 콜백 호출
            onDietUpdate(data.plan.days)

        } catch (error) {
            console.error("채팅 오류:", error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "죄송해요, 오류가 발생했어요. 다시 시도해주세요."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleClose = () => {
        setMessages([])
        setInput("")
        onClose()
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent side="bottom" className="h-[60vh] sm:h-[50vh] min-h-[300px] rounded-t-3xl">
                <SheetHeader className="pb-2">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Sparkles size={16} className="text-indigo-600" />
                        </div>
                        {mealTitle} 식단 조정
                    </SheetTitle>
                    <SheetDescription>
                        상황을 알려주시면 맞춤 식단을 추천해드려요
                    </SheetDescription>
                </SheetHeader>

                {/* 채팅 메시지 영역 */}
                <ScrollArea className="flex-1 px-4 py-2">
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <Sparkles size={32} className="mx-auto mb-3 text-indigo-300" />
                                <p className="text-sm">예시: "시간이 없어서 간단한 걸로 추천해줘"</p>
                                <p className="text-sm">"닭가슴살은 너무 물려 돼지고기가 포함된 걸로 추천해줘"</p>
                                <p className="text-sm">"여유롭게 먹고 싶어"</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-indigo-500 text-white rounded-br-md'
                                        : 'bg-slate-100 text-slate-700 rounded-bl-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-md">
                                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* 입력 영역 */}
                <SheetFooter className="border-t pt-4">
                    <div className="flex gap-2 w-full">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="상황을 입력하세요..."
                            className="flex-1 rounded-full"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="rounded-full bg-indigo-500 hover:bg-indigo-600"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
