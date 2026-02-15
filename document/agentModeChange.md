# 집/회사 모드 전환 기능 설계

## 개요

`agent/page.tsx`의 **식단 계획 제공** 섹션에 **집 / 회사 모드 전환 토글 버튼**을 추가하여,
선택된 모드의 주소 기준 반경 500m 음식점 메뉴를 출력하도록 한다.

## 현재 상태

```
온보딩(address/page.tsx)
  └─ localStorage "user_locations" 에 아래 구조로 저장됨
     [
       { label: "home",    address_text: "...", radius_m: 500 },
       { label: "company", address_text: "...", radius_m: 500 }
     ]

agent/page.tsx
  └─ useEffect에서 home 라벨만 찾아서 fetchMenuSave() 호출
  └─ company 라벨은 무시됨 (미사용)
```

## 변경 흐름

```
┌────────────────────────────────────────────────┐
│         식단 계획 제공 섹션 (Carousel 상단)      │
│                                                │
│   [ 🏠 집 ]  [ 🏢 회사 ]   ← 토글 버튼 추가     │
│                                                │
│   버튼 클릭 시:                                 │
│    → locationMode 상태 변경 ("home" | "company")│
│    → fetchMenuSave(해당 모드 주소) 재호출         │
│    → restaurantData 갱신 → 메뉴 카드 리렌더링    │
└────────────────────────────────────────────────┘
```

## 구현 계획

### 1단계: 상태 추가 (agent/page.tsx)

로컬 상태 1개 추가:

```tsx
const [locationMode, setLocationMode] = useState<"home" | "company">("home");
```

### 2단계: useEffect 수정 — 식당 데이터 fetch 로직

**현재 코드 (179~220줄):**

- `user`가 바뀔 때만 실행
- `homeLocation`만 찾아서 `fetchMenuSave` 호출

**변경 방향:**

- 의존성 배열에 `locationMode` 추가
- `locationMode` 값에 따라 `home` 또는 `company` 라벨 검색
- 모드 전환 시 자동으로 재호출

```tsx
// 변경 전
const homeLocation = locations.find((loc: any) => loc.label === "home");

// 변경 후
const targetLocation = locations.find((loc: any) => loc.label === locationMode);
```

useEffect 의존성 배열:

```tsx
// 변경 전
}, [user]);

// 변경 후
}, [user, locationMode]);
```

### 3단계: UI — 토글 버튼 추가

**식단 계획 제공** 섹션의 제목(`<h2>`) 옆에 토글 버튼 2개 배치:

```
[식단 계획 제공]          [ 🏠 집 | 🏢 회사 ]
```

- 선택된 모드: `bg-indigo-500 text-white` (활성 상태)
- 비선택 모드: `bg-slate-100 text-slate-500` (비활성 상태)
- 클릭 시 `setLocationMode()` 호출

### 4단계: 로딩 처리

모드 전환 시 `setIsRestaurantLoading(true)` → 데이터 fetch 완료 후 `false`
(이미 기존 로딩 플로우가 있어서 자연스럽게 연동됨)

## 수정 대상 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/agent/page.tsx` | `locationMode` 상태 추가, useEffect 수정, 토글 UI 추가 |

> [!NOTE]
> API(`fetchMenuSave`), 컴포넌트, 타입, 스토어 등 다른 파일은 변경 불필요.
> `company` 주소 데이터는 이미 온보딩에서 `localStorage`에 저장되고 있으므로 그대로 사용 가능.

## 검증 방법

1. 온보딩에서 집/회사 주소 모두 입력 후 agent 페이지 진입
2. 기본값 "집" 모드에서 식당 메뉴 정상 출력 확인
3. "회사" 버튼 클릭 → 로딩 표시 후 회사 주소 기준 메뉴로 변경 확인
4. 다시 "집" 클릭 → 집 주소 기준 메뉴 복원 확인
5. `console.log` 에서 API 호출 파라미터가 모드에 따라 바뀌는지 확인
