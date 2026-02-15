# 0215 에이전트 페이지 리팩토링 계획

## 목적

에이전트 페이지(`agent/page.tsx`)는 메인 페이지를 복사해서 만든 것이라 **불필요한 API 호출이 남아있어 fetch 오류가 발생**하고 있다.
메인 페이지는 추후 삭제 예정이므로, **에이전트 페이지를 실질적인 메인으로 정리**한다.

---

## 현재 에이전트 페이지 API 사용 현황

| API 함수 | 현재 상태 | 리팩토링 후 | 사유 |
|--|--|--|--|
| `getUser` | ✅ 사용 | ✅ **유지** | "~~~님 안녕하세요" 이름 표시 |
| `getUserGoal` | ✅ 사용 | ✅ **유지** | 목표 설정 가져오기 |
| `getTodayIntake` | ✅ 사용 | ✅ **유지** | 칼로리 바 (탄단지 그래프) |
| `fetchMenuSave` | ✅ 사용 | ✅ **유지** | 집/회사 모드별 식당 추천 (핵심 기능) |
| `getDietplan` | ✅ 사용 | 🔴 **삭제** | 메인에서 복사해온 것, 에이전트에선 불필요 |
| `getNearbyPlaces` | ✅ 사용 | 🔴 **삭제** | handleFoodClick에서 사용, 에이전트에선 불필요 |

---

## 에이전트 페이지(`agent/page.tsx`) 변경 계획

### 🟢 유지할 것

1. **로그인 체크 + 유저 정보 fetch** (89~123줄) — `getUser`, `getUserGoal`
2. **오늘의 섭취 칼로리 바** UI + `getTodayIntake`
3. **어시스턴트 메시지** (체크된 식사 기반 격려 메시지)
4. **식단 계획 제공 섹션** — `fetchMenuSave` 기반 식당 추천 + 집/회사 모드 전환
5. **FloatingCameraButton**

### 🔴 삭제할 것

1. **`getDietplan` 관련 useEffect** (125~177줄)
   - `getDietplan()` 호출 로직 전체
   - 관련 state: `isPlanLoading`, `PlanSkeleton` 컴포넌트
   - `dietPlan` 관련 useEffect (227~233줄)
   - import에서 `getDietplan` 제거
2. **`handleFoodClick` 함수** (245~294줄)
   - `getNearbyPlaces` 호출 로직 전체
   - import에서 `getNearbyPlaces` 제거
3. **`DietMapModal`** (497~501줄)
   - 지도 모달 컴포넌트 + 관련 state(`isMapOpen`, `mapData`)
   - import에서 `DietMapModal` 제거
4. **불필요한 state/변수 정리**
   - `handleAddMenu` 함수 (빈 함수)
   - `PlaceholderFoodItem` 내 사용 안 하는 것 확인 후 정리
   - import에서 안 쓰는 아이콘(`ChevronRight`, `Utensils`, `Square`, `MapPin`) 정리

### 🟡 정리할 import

```diff
- import DietMapModal from "@/components/DietMapModal"
- import { ChevronRight, Utensils, Square, MapPin, Home, Building2 } from "lucide-react"
+ import { Home, Building2 } from "lucide-react"

- import { getUser, getDietplan, getUserGoal, getTodayIntake, getNearbyPlaces, fetchMenuSave } from "@/api/index"
+ import { getUser, getUserGoal, getTodayIntake, fetchMenuSave } from "@/api/index"

- import { DietPlanKakaoMap, Restaurant, RestaurantMenuItem } from "@/types/definitions"
+ import { Restaurant, RestaurantMenuItem } from "@/types/definitions"
```

### 🟡 Zustand store 사용 정리

```diff
- const { dietPlan, setDietPlan, todayIntake, setTodayIntake, lastFetched, checkedMeals, toggleMealCheck, resetDiet, currentMealSlide, setCurrentMealSlide } = useDietStore();
+ const { todayIntake, setTodayIntake, checkedMeals, currentMealSlide, setCurrentMealSlide } = useDietStore();
```

---

## 리팩토링 후 에이전트 페이지 구조 (예상)

```
에이전트 페이지 (agent/page.tsx)
├── Header: "~~~님 안녕하세요"          ← getUser (유지)
├── 어시스턴트 메시지                     ← checkedMeals (유지)
├── 오늘의 섭취 칼로리 바                 ← getTodayIntake (유지)
├── 식단 계획 제공 섹션                   ← fetchMenuSave (유지)
│   └── [🏠 집 | 🏢 회사] 토글           ← locationMode (유지)
├── FloatingCameraButton                ← (유지)
└── (getDietplan, getNearbyPlaces, DietMapModal 삭제됨)
```

---

## 검증 방법

- `npm run build` 로 빌드 에러 없는지 확인
- 에이전트 페이지 접속 시 이름, 칼로리 바 정상 표시 확인
- 집/회사 모드 전환 + 식당 추천 정상 작동 확인
- 콘솔에 불필요한 fetch 오류가 사라졌는지 확인

---

# 리팩토링 실행 결과 (2026-02-15)

## 코드 규모 변화

- **리팩토링 전**: 538줄
- **리팩토링 후**: 약 310줄
- **삭제된 코드**: 약 230줄

---

## 🔴 삭제된 코드 상세

### 1. `getDietplan` useEffect (구 129~181줄)

- **기능**: AI가 생성한 일반 식단 계획(아침/점심/저녁)을 백엔드에서 받아와 화면에 표시
- **삭제 사유**: 에이전트 페이지에서는 `fetchMenuSave`(실제 식당 기반 추천)를 사용하므로, AI 식단 계획 API는 중복/불필요
- **포함된 코드**:
  - `getUserGoal()` → `getDietplan()` 체인 호출
  - `ONE_HOUR` 캐시 로직 (1시간마다 재요청)
  - `dietPlan` 상태 업데이트
  - `today_intake` 응답 처리

### 2. `dietPlan` 관련 useEffect (구 232~238줄)

- **기능**: `dietPlan` 상태가 변경될 때 콘솔 로그 출력 + 로딩 해제
- **삭제 사유**: `dietPlan` 자체를 더 이상 사용하지 않으므로 불필요

### 3. `handleFoodClick` 함수 (구 250~299줄)

- **기능**: 음식 이름 클릭 시 `navigator.geolocation`으로 현재 위치를 얻어 `getNearbyPlaces` API를 호출, 주변 식당을 지도 모달에 표시
- **삭제 사유**: 에이전트 페이지에서는 식당 검색을 `fetchMenuSave`로 처리하며, 지도 모달 기능은 불필요
- **포함된 코드**:
  - `navigator.geolocation.getCurrentPosition()` 호출
  - `getNearbyPlaces(foodName, lat, lng)` API 호출
  - `DietPlanKakaoMap` 객체 생성
  - `setMapData()`, `setIsMapOpen()` 상태 업데이트

### 4. `handleAddMenu` 함수 (구 246~248줄)

- **기능**: "메뉴 추가" 버튼 핸들러 (빈 함수, 미구현 상태)
- **삭제 사유**: 실제 기능 없는 빈 함수

### 5. `DietMapModal` (구 528~533줄)

- **기능**: 카카오맵 기반 주변 식당 지도 모달 표시
- **삭제 사유**: `handleFoodClick` 삭제에 따라 지도 모달도 불필요
- **포함된 코드**:
  - `<DietMapModal>` JSX
  - `isMapOpen`, `mapData` 상태 변수
  - `DietMapModal` import

### 6. 삭제된 state/변수들

| 변수명 | 용도 | 삭제 사유 |
|--|--|--|
| `isPlanLoading` | AI 식단 계획 로딩 표시 | `getDietplan` 삭제로 불필요 |
| `PlanSkeleton` | 식단 로딩 스켈레톤 UI | `getDietplan` 삭제로 불필요 |
| `isMapOpen` | 지도 모달 열림 상태 | `DietMapModal` 삭제로 불필요 |
| `mapData` | 지도에 표시할 데이터 | `DietMapModal` 삭제로 불필요 |
| `dietPlan` | Zustand에서 가져온 AI 식단 | `getDietplan` 삭제로 불필요 |
| `setDietPlan` | AI 식단 상태 업데이트 | `getDietplan` 삭제로 불필요 |
| `lastFetched` | 캐시 타임스탬프 | `getDietplan` 삭제로 불필요 |
| `toggleMealCheck` | 식단 체크 토글 | 에이전트에서 미사용 |

### 7. 삭제된 import들

```diff
- import DietMapModal from "@/components/DietMapModal"
- import { ChevronRight, Utensils, Square, MapPin } from "lucide-react"
- import { getDietplan, getNearbyPlaces } from "@/api/index"
- import { DietPlanKakaoMap } from "@/types/definitions"
```

---

## 🟢 유지 + 변경된 코드

### 1. 오늘의 섭취 useEffect (변경)

- **변경 전**: `getDietplan` useEffect 안에 `getTodayIntake` 호출이 함께 존재 (구 129~181줄)
- **변경 후**: `getTodayIntake`만 **별도의 독립 useEffect**로 분리

```tsx
// 오늘의 섭취 정보 가져오기 (독립 useEffect)
useEffect(() => {
  if (!user) return;
  if (user && !todayIntake) {
    getTodayIntake()
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setTodayIntake(data); })
      .catch(err => console.error(err));
  }
}, [user]);
```

### 2. `AgentFoodItem` 컴포넌트 (변경)

- **변경 전**: `onClick` prop이 필수 (`onClick: () => void`)
- **변경 후**: `onClick` prop을 optional로 변경 (`onClick?: () => void`)
- **사유**: `handleFoodClick` 삭제로 인해 더 이상 onClick을 전달하지 않음

### 3. 그 외 유지된 코드

| 코드 | 기능 | 상태 |
|--|--|--|
| 로그인 체크 useEffect | `getUser`, `getUserGoal` 호출 | ✅ 변경 없음 |
| `fetchMenuSave` useEffect | 집/회사 주소 기반 식당 추천 | ✅ 변경 없음 |
| 칼로리 바 UI | 탄수화물/단백질/지방 그래프 | ✅ 변경 없음 |
| 어시스턴트 메시지 | 체크된 식사 기반 격려 문구 | ✅ 변경 없음 |
| 식단 Carousel | 아침/점심/저녁 카드 슬라이드 | ✅ 변경 없음 |
| 집/회사 토글 버튼 | `locationMode` 전환 | ✅ 변경 없음 |
| `FloatingCameraButton` | 카메라 FAB 버튼 | ✅ 변경 없음 |

---

## 최종 파일 구조

```
agent/page.tsx (약 310줄)
│
├── import 정리 (1~15줄)
│   └── getUser, getUserGoal, getTodayIntake, fetchMenuSave만 남김
│
├── State 선언 (19~64줄)
│   ├── Zustand: user, todayIntake, checkedMeals, currentMealSlide
│   ├── Local: isLoading, restaurantData, isRestaurantLoading, checkedItems, locationMode
│   └── Carousel: carouselApi, mealCards
│
├── useEffect 3개 (66~160줄)
│   ├── ① Carousel 동기화
│   ├── ② 로그인 체크 + 유저/목표 fetch (getUser, getUserGoal)
│   ├── ③ 오늘의 섭취 fetch (getTodayIntake) ← 분리됨
│   └── ④ 식당 추천 fetch (fetchMenuSave) + 집/회사 모드 전환
│
├── 핸들러 (170~200줄)
│   ├── PlaceholderFoodItem (로딩 스켈레톤)
│   ├── handleCheckItem (체크 토글)
│   └── getMealItems (식사별 메뉴 추출)
│
└── JSX (202~310줄)
    ├── Header: "~~~님 안녕하세요"
    ├── 어시스턴트 메시지
    ├── 오늘의 섭취 칼로리 바
    ├── 식단 계획 제공 + [집|회사] 토글 + Carousel
    └── FloatingCameraButton
```
