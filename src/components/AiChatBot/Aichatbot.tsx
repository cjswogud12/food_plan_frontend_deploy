"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
    id: number;
    text: string;
    sender: "bot" | "user";
}

export default function AiChatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "안녕하세요 사용자님!\n질문하고 싶으신 내용을\n저에게 알려주세요",
            sender: "bot",
        },
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputValue,
            sender: "user",
        };

        setMessages([...messages, newMessage]);
        setInputValue("");

        // TODO: 나중에 API 연동 시 여기에 챗봇 응답 로직 추가
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* 헤더 */}
            <div className="bg-gray-100 py-4 text-center">
                <h1 className="text-2xl font-bold text-purple-500">AI 식단 챗봇</h1>
            </div>

            {/* 채팅 영역 */}
            <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {/* 챗봇 라벨 */}
                            {message.sender === "bot" && (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center bg-white">
                                        <span className="text-xs font-medium">챗봇</span>
                                    </div>
                                </div>
                            )}

                            {/* 메시지 말풍선 */}
                            <div
                                className={`max-w-[70%] px-4 py-3 rounded-2xl ${message.sender === "user"
                                        ? "bg-[#8B7EC8] text-white"
                                        : "bg-white text-gray-800 border border-gray-200"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                            </div>

                            {/* 유저 라벨 */}
                            {message.sender === "user" && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                        유저
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="p-4 bg-white border-t">
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="내용을 입력하세요."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 rounded-full border-gray-300"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-purple-500 hover:bg-purple-600"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
