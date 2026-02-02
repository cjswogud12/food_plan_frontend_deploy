"use client";

import { useState, useEffect, useRef } from "react";
import { useViewport } from "@/context/ViewportContext"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { User } from "@/types/definitions"
import { getUser, getRecord, getMypage, chat } from "@/api/index"

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
    const [user, setUser] = useState<User | null>(null);
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [userGoal, setUserGoal] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Fetch Context Data
    useEffect(() => {
        const fetchContextData = async () => {
            try {
                // 1. User Info
                const userRes = await getUser();
                if (userRes.ok) setUser(await userRes.json());

                // 2. Today's Record
                const dateString = new Date().toISOString().split('T')[0];
                const recordRes = await getRecord(dateString);
                if (recordRes.ok) setTodayRecord(await recordRes.json());

                // 3. User Goal (Mypage)
                const goalRes = await getMypage();
                if (goalRes.ok) setUserGoal(await goalRes.json());

            } catch (error) {
                console.error("Failed to fetch context data:", error);
            }
        };
        fetchContextData();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessageText = inputValue;
        const newMessage: Message = {
            id: messages.length + 1,
            text: userMessageText,
            sender: "user",
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Aggregate Context
            const context = {
                userProfile: user,
                todayRecord: todayRecord,
                goals: userGoal
            };

            // Call Chat API
            const response = await chat(userMessageText, context);

            if (response.ok) {
                const data = await response.json();
                const botResponseText = data.response || "죄송합니다. 답변을 생성할 수 없습니다."; // Adjust based on actual API response structure

                const botMessage: Message = {
                    id: messages.length + 2,
                    text: botResponseText,
                    sender: "bot",
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                throw new Error("API request failed");
            }

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                id: messages.length + 2,
                text: "죄송합니다. 지금은 대답하기 어렵네요. 잠시 후 다시 시도해주세요.",
                sender: "bot",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/10 backdrop-blur-md shadow-2xl">
            {/* 헤더 */}
            <div className="py-4 text-center shrink-0">
                <h1 className="text-2xl font-bold text-[#6A5ACD] drop-shadow-md">AI 식단 챗봇</h1>
            </div>

            {/* 채팅 영역 */}
            <ScrollArea className="flex-1 px-4 py-2 overflow-hidden">
                <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {/* 챗봇 라벨 */}
                            {message.sender === "bot" && (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white shadow-lg">
                                        <img
                                            src="/images/chatbot_icon.png"
                                            alt="챗봇"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerText = '챗봇';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 메시지 말풍선 */}
                            <div
                                className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md ${message.sender === "user"
                                    ? "bg-[#8B7EC8] text-white shadow-purple-500/20"
                                    : "bg-white/90 text-gray-800 shadow-black/5"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                            </div>

                            {/* 유저 라벨 */}
                            {message.sender === "user" && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold text-[#6A5ACD] bg-white/80 px-2 py-1 rounded shadow-sm">
                                        {user?.username || '유저'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white shadow-lg flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#6A5ACD]" />
                                </div>
                            </div>
                            <div className="bg-white/90 text-gray-500 px-4 py-3 rounded-2xl shadow-md shadow-black/5">
                                <span className="text-sm animate-pulse">답변을 작성중입니다...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollEndRef} />
                </div>
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-white/30 bg-white/20 shrink-0">
                <div className="flex gap-2 items-center">
                    <Input
                        placeholder="내용을 입력하세요."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1 rounded-full border-white/50 bg-white/60 placeholder:text-gray-500 text-gray-800 focus:bg-white focus:ring-[#6A5ACD] shadow-inner"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading}
                        size="icon"
                        className="rounded-full bg-[#6A5ACD] hover:bg-[#5848b7] text-white shadow-lg disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
