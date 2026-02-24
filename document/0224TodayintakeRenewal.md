# 오늘의 섭취 UI 리뉴얼 구현 계획

## 날짜

2026-02-24

## 목표

"오늘의 섭취" 섹션을 **체크박스로 합산된 실제 섭취량 / 목표 섭취량** 형태로 변경

## 현재 구조 분석

### 현재 UI (page.tsx 306~363줄)

- `todayIntake.total_calories_kcal`을 그대로 표시 (API 응답 값)
- 탄수화물/단백질/지방도 `todayIntake`에서 바로 표시
- 프로그레스 바도 `todayIntake` 값 기준으로 비율 계산

### 사용 가능한 데이터 소스

#### 1. `todayIntake` (API: `/api/intake/today`)

```typescript
interface TodayIntake {
    goal_type: string;
    target_calorie: number;       // ← 목표 칼로리 (섭취해야 할 총량)
    total_calories_kcal: number;  // 식단 계획의 총 칼로리
    total_carbs_g: number;        // 식단 계획의 총 탄수화물
    total_protein_g: number;      // 식단 계획의 총 단백질
    total_fat_g: number;          // 식단 계획의 총 지방
    plan_date: string;
}
```

#### 2. `checkedMeals` (Zustand store, localStorage persist)

```typescript
// 구조: { "2026-02-24": { breakfast: [...], lunch: [...], dinner: [] } }
// 각 아이템에 포함된 영양 정보:
{
    menuId: number,
    food_name: string,
    calories_kcal: number,    // ← 합산에 사용
    carbs_g: number,          // ← 합산에 사용
    protein_g: number,        // ← 합산에 사용
    fat_g: number,            // ← 합산에 사용
    restaurant_name: string,
    price: number
}
```

#### 3. `restaurantData` (API: `/api/menu-save`)

```typescript
interface Restaurant {
    daily_target_kcal: number;      // ← 일일 목표 칼로리 (대안 소스)
    meal_target_kcal: {
        breakfast: number;           // 끼니별 목표 칼로리
        lunch: number;
        dinner: number;
    };
}
```

---

## 변경 내용

### 1단계: 체크박스 합산 값 계산 (useMemo 추가)

`page.tsx`에 `checkedMeals`의 오늘 날짜 데이터를 합산하는 `useMemo` 추가:

```tsx
// checkedMeals에서 오늘 체크된 음식의 영양 성분 합산
const checkedNutrition = useMemo(() => {
    const dayMeals = checkedMeals[today] || { breakfast: [], lunch: [], dinner: [] };
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;

    (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
        const list = dayMeals[type];
        if (Array.isArray(list)) {
            list.forEach((item: any) => {
                totalCalories += item.calories_kcal || 0;
                totalCarbs += item.carbs_g || 0;
                totalProtein += item.protein_g || 0;
                totalFat += item.fat_g || 0;
            });
        }
    });

    return { totalCalories, totalCarbs, totalProtein, totalFat };
}, [checkedMeals, today]);
```

### 2단계: 목표 영양 성분 값 결정

**목표 칼로리**: `todayIntake.target_calorie` 또는 `restaurantData.daily_target_kcal` 사용

> ⚠️ 참고: `todayIntake`에는 `target_calorie`만 있고, 목표 탄수화물/단백질/지방 개별 값이 없다.
> `todayIntake.total_carbs_g` 등은 "식단 계획의 총량"이므로 이것을 목표 영양 성분으로 사용 가능.

```tsx
const targetCalories = todayIntake?.target_calorie || 0;
const targetCarbs = todayIntake?.total_carbs_g || 0;
const targetProtein = todayIntake?.total_protein_g || 0;
const targetFat = todayIntake?.total_fat_g || 0;
```

### 3단계: UI 변경 (page.tsx 306~363줄)

#### 칼로리 표시 변경

```
변경 전: 0 kcal
변경 후: 450 / 2100 kcal
          (체크 합산)  (목표)
```

구체적인 코드:

```tsx
<div className="text-right flex items-end justify-end gap-1">
    <span className="text-lg font-extrabold text-slate-800 leading-none">
        {Math.round(checkedNutrition.totalCalories)}
    </span>
    <span className="text-[10px] text-slate-400 font-medium mb-0.5">
        / {Math.round(targetCalories)} kcal
    </span>
</div>
```

#### 프로그레스 바 변경

현재: 탄수화물/단백질/지방 비율로 stacked bar
변경: **체크 합산 칼로리 / 목표 칼로리**의 진행률 바로 변경

```tsx
{(() => {
    const progress = targetCalories > 0
        ? Math.min((checkedNutrition.totalCalories / targetCalories) * 100, 100)
        : 0;

    return (
        <div className="h-6 w-full bg-indigo-50 rounded-full overflow-hidden relative border border-indigo-100/50 shadow-inner">
            <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
})()}
```

#### 영양소 Legend 변경

```
변경 전: 탄수화물 0 g  |  단백질 0 g  |  지방 0 g
변경 후: 탄수화물 30/120 g  |  단백질 25/80 g  |  지방 10/40 g
           (체크합산)/(목표)
```

구체적인 코드 (탄수화물 예시, 단백질/지방도 동일 패턴):

```tsx
<span className="text-base font-extrabold text-slate-800">
    {Math.round(checkedNutrition.totalCarbs)}
</span>
<span className="text-[10px] text-slate-400">
    /{Math.round(targetCarbs)} g
</span>
```

---

## 데이터 흐름 요약

```
식단 카드에서 체크박스 클릭
    ↓
handleCheckItem() → toggleMealCheck() → checkedMeals 업데이트 (Zustand)
    ↓
checkedNutrition (useMemo) 자동 재계산
    ↓
"오늘의 섭취" UI에 실시간 반영
```

---

## 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/page.tsx` | `checkedNutrition` useMemo 추가, 오늘의 섭취 UI 변경 (306~363줄) |

> 타입 변경이나 API 변경은 필요 없음. 기존 데이터 구조를 그대로 활용.

---

## 검증 방법

### 수동 테스트 (배포 후)

1. 메인 페이지 접속 → "오늘의 섭취"에 `0 / {목표칼로리} kcal` 형태로 표시되는지 확인
2. 식단 카드에서 메뉴 체크 → 칼로리와 영양 성분이 실시간으로 합산되는지 확인
3. 체크 해제 → 합산 값이 줄어드는지 확인
4. 페이지 새로고침 → 체크 상태 유지 + 합산 값 유지 (localStorage persist)
5. 프로그레스 바가 합산 칼로리 / 목표 칼로리 비율에 맞게 채워지는지 확인
