"use client"

import { useDietStore } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Minus, Droplets } from "lucide-react"
import { useEffect, useState } from "react"

export function WaterTracker() {
    const { waterIntake, waterGoal, setWaterIntake } = useDietStore()
    const [percent, setPercent] = useState(0)

    useEffect(() => {
        // Hydration mismatch 방지를 위해 useEffect 내에서 계산하거나
        // 간단하게 바로 계산해도 되지만, 애니메이션 효과를 위해
        const p = Math.min(100, (waterIntake / waterGoal) * 100);
        setPercent(p);
    }, [waterIntake, waterGoal])

    const addWater = (amount: number) => {
        setWaterIntake(waterIntake + amount)
    }

    const removeWater = (amount: number) => {
        setWaterIntake(Math.max(0, waterIntake - amount))
    }

    return (
        <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-100">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm flex items-center gap-2 text-cyan-900">
                        <div className="p-1.5 bg-cyan-100 rounded-lg">
                            <Droplets size={16} className="text-cyan-600" />
                        </div>
                        수분 섭취
                    </CardTitle>
                    <div className="text-right">
                        <span className="text-xl sm:text-2xl font-bold text-cyan-700">{waterIntake}</span>
                        <span className="text-xs text-slate-500 ml-1">/ {waterGoal}ml</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 sm:space-y-4">
                    <Progress value={percent} className="h-3 bg-cyan-100" indicatorClassName="bg-cyan-500" />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addWater(200)}
                            className="bg-white border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 h-9 text-xs"
                        >
                            +200ml
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addWater(500)}
                            className="bg-white border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 h-9 text-xs"
                        >
                            +500ml
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWater(200)}
                            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-400 h-9"
                        >
                            <Minus size={14} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWaterIntake(0)}
                            className="bg-white border-slate-200 hover:bg-red-50 hover:text-red-500 text-slate-400 h-9 text-xs"
                        >
                            초기화
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
