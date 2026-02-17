# Agent Page 머지 충돌 분석 및 수정 기록

> **날짜**: 2026-02-16 분석, 수정 적용  
> **대상 파일**: `src/app/agent/page.tsx`  
> **머지 브랜치**: `yoh_0215_agent` ← `cyh0215_agent6`

---

## 1. 각 브랜치 주요 커밋 요약

### 브랜치: `cyh0215_agent6` (didgus67 작업분)

| 날짜 | 커밋 메시지 | 주요 내용 |
|------|------------|----------|
| 2/15 | agent/page.tsx 불필요한 API 삭제, zustand 전역상태관리, 전반적 리팩토링 | 기존 메인페이지에서 복사해온 불필요한 API 호출 제거, Zustand store로 전환 |
| 2/15 | agent/page.tsx → 집/회사 모드 변환 기능 추가 | `locationMode` 상태로 집/회사 전환, `fetchMenuSave` API 연동 |
| 2/13 | 마이페이지 주소 설정(work/home) 및 API 경로 수정 | 주소 관련 API 엔드포인트 정리 |
| 2/13 | agent page 엔드포인트 설정 | Agent 페이지 전용 API 경로 설정 |

### 브랜치: `yoh_0215_agent` (cjswogud12 작업분)

| 날짜 | 커밋 메시지 | 주요 내용 |
|------|------------|----------|
| 2/15 | 마이페이지 주소, 목표 기능 수정 및 추가 | 마이페이지에서 주소/목표 CRUD 기능 |
| 2/13 | onboarding → TDEE → address 페이지 및 깡통 생성완료 | 온보딩 플로우 UI 틀 생성 |
| 2/13 | tdee를 위한 survey 페이지 개설 | TDEE 설문 페이지 신규 생성 |
| 2/13 | 메인페이지 ui (기존, 수정본(agent) 혼합) | 기존 메인페이지와 agent 페이지 UI 혼합 |
| 2/13 | home2 → 테스트 페이지 | 테스트용 페이지 라우팅 변경 |

### 공통 커밋 (양 브랜치 동일)

- `store/index.ts` 재수정, 상태관리 오류 수정 (2/9)
- 컴포넌트 삭제 및 나의목표 수정 (2/6)
- 인바디 기록 삭제 오류 해결 (2/6)

---

## 2. 발견된 오류 목록 및 수정 결과

### ✅ 오류 1: `locationMode` / `setLocationMode` 미선언 → 해결

**수정 내용**: 29줄에 `useState` 선언 추가

```tsx
const [locationMode, setLocationMode] = useState<"home" | "company">("home");
```

---

### ✅ 오류 2: `RestaurantMenuItem` 타입 미임포트 → 해결

**수정 내용**: import에 `RestaurantMenuItem` 추가

```tsx
import { DietPlanKakaoMap, Restaurant, RestaurantMenuItem } from "@/types/definitions"
```

---

### ✅ 오류 3: shadcn Carousel → 3D Rotary Carousel 교체 → 해결

**수정 내용**: shadcn `Carousel` 관련 import/상태를 제거하고, `yoh_0215_agent`의 3D Rotary Carousel JSX로 교체.

**제거된 항목**:

- import: `Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi`
- import: `Card, CardHeader, CardTitle, CardContent`
- 상태: `const [carouselApi, setCarouselApi] = useState<CarouselApi>()`

**적용된 3D Carousel**: `perspective`, `rotateY`, `translateZ`, `preserve-3d` CSS를 사용한 입체 회전 Carousel. 기존 50~81줄의 3D 로직(`rotationAngle`, `handleTouchStart/Move/End`)과 인디케이터(345~360줄)는 그대로 유지.

---

### ✅ 오류 4: `getMealItems` 미사용 → 실제 데이터 렌더링 연결 → 해결

**수정 내용**: 3D Carousel 카드 내부에서 `getMealItems`와 `AgentFoodItem`을 사용하여 실제 데이터 렌더링

```tsx
{isRestaurantLoading ? (
  <><PlaceholderFoodItem /><PlaceholderFoodItem /><PlaceholderFoodItem /></>
) : getMealItems(meal.key).length > 0 ? (
  getMealItems(meal.key).map((item) => (
    <AgentFoodItem key={item.menu_id} item={item} isChecked={...} onCheck={...}/>
  ))
) : (
  <p className="text-sm text-slate-400 text-center py-4">추천 메뉴가 없습니다</p>
)}
```

---

### ✅ 오류 5: `AgentFoodItem` 컴포넌트 미연결 → 해결

**수정 내용**: import 추가

```tsx
import AgentFoodItem from "@/components/agent/Mainagent"
```

---

## 3. 수정 후 현재 코드 구조

```
src/app/agent/page.tsx
├── import 영역
│   ├── React hooks (useState, useEffect, useRef, useCallback)
│   ├── Zustand stores (useUserStore, useDietStore)
│   ├── API 함수 (getUser, getUserGoal, getTodayIntake, fetchMenuSave)
│   ├── 타입 (DietPlanKakaoMap, Restaurant, RestaurantMenuItem)
│   ├── lucide-react 아이콘 (Home, Building2, ChevronRight, Utensils, Square)
│   └── AgentFoodItem 컴포넌트
│
├── 상태 선언
│   ├── Zustand 전역 상태 (user, dietPlan, todayIntake, checkedMeals 등)
│   ├── locationMode useState ("home" | "company")
│   ├── restaurantData, isRestaurantLoading, checkedItems
│   └── 3D Carousel (rotationAngle, touchStartX, touchDelta, isDragging)
│
├── 이벤트 핸들러 (3D Carousel)
│   ├── handleTouchStart
│   ├── handleTouchMove
│   └── handleTouchEnd
│
├── useEffect 훅
│   ├── 로그인 체크 & 유저 정보
│   ├── 오늘의 섭취 정보
│   ├── 식당 메뉴 추천 (locationMode 의존)
│   └── Store Hydration Sync
│
├── 헬퍼 함수
│   ├── PlaceholderFoodItem (로딩/폴백 UI)
│   ├── handleCheckItem (체크 토글)
│   └── getMealItems (식사별 메뉴 조회)
│
└── JSX
    ├── Header (인사말)
    ├── Assistant Message (식사 상태 메시지)
    ├── 영양소 그래프 (Stacked Bar)
    └── 식단 Carousel 섹션
        ├── 집/회사 모드 토글 (Button)
        ├── 슬라이드 인디케이터 (rotationAngle 연동)
        └── 3D Rotary Carousel (perspective + rotateY)
            └── AgentFoodItem 실제 데이터 렌더링
```

---

## 4. 참고사항

- `checkedItems`(로컬 Set 상태)와 `checkedMeals`(Zustand store)가 별도로 존재함. 추후 하나로 통합 고려 필요.
- `mapData`, `isMapOpen` 상태가 선언되어 있으나 사용되지 않음 (지도 기능 향후 구현 예정이면 유지, 아니면 삭제).
- `DietPlanKakaoMap` 타입은 import 되어 있으나 `mapData` 외에는 미사용.
- `ChevronRight`, `Utensils`, `Square` 아이콘은 `PlaceholderFoodItem`에서 사용됨.

---

## 5. 적용된 수정 요약 (2026-02-17)

| 순서 | 작업 | 상태 |
|------|------|------|
| 1 | `locationMode` useState 선언 추가 (29줄) | ✅ 완료 |
| 2 | `RestaurantMenuItem` import 추가 (11줄) | ✅ 완료 |
| 3 | shadcn Carousel import/상태 제거 | ✅ 완료 |
| 4 | shadcn Carousel JSX → 3D Rotary Carousel JSX 교체 | ✅ 완료 |
| 5 | `AgentFoodItem` import 추가 (12줄) | ✅ 완료 |
| 6 | PlaceholderFoodItem → 실제 데이터 렌더링 (3D 카드 내부) | ✅ 완료 |
