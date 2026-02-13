# 🍽️ Agent 페이지 — 식단 카드 수평 스와이프 UI 구현 계획

## 목표

`src/app/agent/page.tsx`의 **"식단 계획 제공"** 섹션을 리팩토링하여,
아침 / 점심 / 저녁 3장의 카드가 **좌우 수평 스와이프(Carousel)**로 전환되는 UI를 구현합니다.

- 카드 내부 콘텐츠는 **빈 깡통(placeholder) UI**만 구성
- **shadcn UI** 컴포넌트(`Card`, `Carousel`) 사용
- 슬라이드 상태는 **Zustand 전역 스토어**에서 관리

---

## 현재 구조 분석

### 기존 shadcn 컴포넌트

| 컴포넌트 | 파일 | 상태 |
|----------|------|------|
| Card | `src/components/ui/card.tsx` | ✅ 설치됨 |
| Carousel | — | ❌ **설치 필요** |

### Zustand Store (`src/store/index.ts`)

| Store | 용도 |
|-------|------|
| `useUserStore` | 사용자 정보, 목표 관리 |
| `useDietStore` | 식단 계획, 오늘의 섭취, 체크 상태 관리 |
| `useInbodyStore` | 인바디 데이터 관리 |

→ `useDietStore`에 `currentMealSlide` 상태를 추가하여 슬라이드 인덱스를 전역 관리

---

## 구현 계획

### 1단계: shadcn Carousel 컴포넌트 설치

```bash
npx shadcn@latest add carousel
```

- `src/components/ui/carousel.tsx` 생성
- `embla-carousel-react` 의존성 자동 설치

---

### 2단계: 식단 카드 구조 설계

각 카드(아침/점심/저녁)는 다음 구조를 가집니다:

```
┌──────────────────────────────┐
│  ☀️ 아침 식단                │  ← CardHeader (제목 + 이모지)
│                              │
│  ┌────────────────────────┐  │
│  │ [☐] [img] 음식명       │  │  ← 체크박스 + 이미지 + 텍스트
│  │          --- kcal      │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ [☐] [img] 음식명       │  │  ← 체크박스 + 이미지 + 텍스트
│  │          --- kcal      │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

> **변경사항:** `+ 메뉴 추가하기` 버튼 **제거**, 음식 아이템 왼쪽 아이콘을 **체크박스**로 교체

#### 카드 데이터 배열

```tsx
const mealCards = [
  { key: "breakfast", title: "아침 식단", icon: "☀️" },
  { key: "lunch",     title: "점심 식단", icon: "🌤️" },
  { key: "dinner",    title: "저녁 식단", icon: "🌙" },
];
```

---

### 3단계: page.tsx 수정 — Carousel 적용

#### 변경 대상 (현재 420~438번째 줄, "식단 계획 제공" 섹션)

**변경 후 의사코드:**
```tsx
<section className="...">
  <h2>식단 계획 제공</h2>

  {/* 슬라이드 인디케이터 (● ○ ○) */}
  <div className="flex justify-center gap-2">
    {mealCards.map((_, i) => (
      <div className={`w-2 h-2 rounded-full ${
        i === currentMealSlide ? 'bg-indigo-500' : 'bg-slate-200'
      }`} />
    ))}
  </div>

  <Carousel setApi={setCarouselApi}>
    <CarouselContent>
      {mealCards.map((meal) => (
        <CarouselItem key={meal.key}>
          <Card>
            <CardHeader>{meal.icon} {meal.title}</CardHeader>
            <CardContent>
              {/* 빈 깡통 음식 아이템 (체크박스 포함) */}
              <PlaceholderFoodItem />
              <PlaceholderFoodItem />
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</section>
```

---

### 4단계: 빈 깡통 음식 아이템 컴포넌트

기존 `PlanSection`의 체크박스 스타일을 그대로 활용합니다:

```tsx
const PlaceholderFoodItem = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
    {/* 체크박스 (기존 PlanSection과 동일) */}
    <button className="w-6 h-6 rounded-md bg-slate-200 text-slate-400
                        flex items-center justify-center shrink-0">
      <Square size={14} />
    </button>
    {/* 음식 이미지 자리 */}
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
      <Utensils size={16} className="text-slate-300" />
    </div>
    {/* 텍스트 자리 */}
    <div className="flex-1 space-y-1.5">
      <div className="h-3.5 bg-slate-200 rounded w-24" />
      <div className="h-3 bg-slate-100 rounded w-16" />
    </div>
    {/* 화살표 */}
    <ChevronRight size={14} className="text-slate-300" />
  </div>
);
```

---

### 5단계: Zustand 전역 슬라이드 상태 관리

`src/store/index.ts`의 `useDietStore`에 슬라이드 상태를 추가합니다:

**추가할 상태/액션:**

```tsx
// DietState 인터페이스에 추가
currentMealSlide: number;
setCurrentMealSlide: (index: number) => void;
```

**초기값 및 구현:**

```tsx
// useDietStore 내부
currentMealSlide: 0,
setCurrentMealSlide: (index) => set({ currentMealSlide: index }),
```

**page.tsx에서 사용:**

```tsx
const { currentMealSlide, setCurrentMealSlide } = useDietStore();
const [carouselApi, setCarouselApi] = useState<CarouselApi>();

// Carousel API와 Zustand 동기화
useEffect(() => {
  if (!carouselApi) return;

  // 슬라이드 변경 시 Zustand에 반영
  carouselApi.on("select", () => {
    setCurrentMealSlide(carouselApi.selectedScrollSnap());
  });

  // Zustand에 저장된 슬라이드로 초기 위치 설정
  if (currentMealSlide > 0) {
    carouselApi.scrollTo(currentMealSlide);
  }
}, [carouselApi]);
```

> **persist 옵션**: `currentMealSlide`는 `partialize`에 포함하지 않음 (새로고침 시 항상 0번 슬라이드에서 시작)

---

## 파일 변경 요약

| 작업 | 파일 | 설명 |
|------|------|------|
| 설치 | `src/components/ui/carousel.tsx` | shadcn Carousel 컴포넌트 추가 |
| 수정 | `src/store/index.ts` | `currentMealSlide` / `setCurrentMealSlide` 추가 |
| 수정 | `src/app/agent/page.tsx` | 식단 섹션을 Carousel 수평 스와이프로 변경 |

## 검증 방법

1. `npm run dev` → `/agent` 접속
2. "식단 계획 제공" 섹션에서 좌우 스와이프로 아침/점심/저녁 카드 전환 확인
3. 인디케이터(●○○)가 현재 슬라이드와 동기화되는지 확인
4. 체크박스가 각 음식 아이템 왼쪽에 표시되는지 확인
