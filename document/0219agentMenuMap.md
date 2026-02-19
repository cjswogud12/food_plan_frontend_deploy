# Agent 페이지 - 음식 메뉴 클릭 시 카카오맵 가게 연결 개발 계획

> 작성일: 2026-02-19

## 📌 목표

Agent 페이지에서 출력된 음식 메뉴 이름을 클릭하면, 해당 음식을 판매하는 가게의 **카카오맵 상세 페이지**를 새 탭에서 열어주는 기능 구현.

---

## 📊 현재 상태 분석

### 데이터 흐름

```
사용자 주소 입력 → fetchMenuSave(/api/recommend/menu-save) 호출 → Restaurant 데이터 수신 → AgentFoodItem 컴포넌트로 렌더링
```

### 현재 API 응답 구조 (`Restaurant` 타입)

```typescript
// src/types/definitions.ts
export interface Restaurant {
    goal_type: string;
    tdee_kcal: number;
    daily_target_kcal: number;
    meal_target_kcal: { breakfast: number; lunch: number; dinner: number; };
    used_radius_m: number;
    collector_triggered: boolean;
    breakfast: RestaurantMenuItem[];
    lunch: RestaurantMenuItem[];
    dinner: RestaurantMenuItem[];
}

export interface RestaurantMenuItem {
    restaurant_id: number;
    restaurant_name: string;
    menu_id: number;
    menu_name: string;
    price: number;
    distance_m: number;
    calories_kcal: number;
    carbs_g: number;
    protein_g: number;
    fat_g: number;
    confidence: number;
    // ⚠️ place_url 필드가 현재 없음!
}
```

### AgentFoodItem 컴포넌트 (현재)

- 위치: `src/components/agent/Mainagent.tsx`
- 이미 `onClick` prop이 정의되어 있지만 **현재 사용되지 않음**
- 메뉴 이름, 식당명, 거리, 칼로리, 가격이 표시됨

### 기존 참고 구현: `DietMapModal` 컴포넌트

- 위치: `src/components/DietMapModal.tsx`
- `DietPlanKakaoMap` 타입에는 `place_url`이 포함되어 있음
- 카카오맵 SDK를 사용한 지도 + 식당 목록 모달 구현

---

## ⚠️ 핵심 확인 사항 (백엔드 확인 필요)

> [!IMPORTANT]
> **`/api/recommend/menu-save` 응답에 `place_url` 필드가 포함되는지 백엔드에서 확인해야 합니다.**

### 시나리오 A: 응답에 `place_url`이 이미 포함되는 경우

- 프론트엔드 타입 정의에 `place_url` 필드만 추가하면 됨
- 가장 간단한 구현 방법

### 시나리오 B: 응답에 `place_url`이 포함되지 않는 경우

- 백엔드에 `place_url` 포함 요청 필요, 또는
- `restaurant_name` 기반으로 카카오맵 검색 URL 생성 방식으로 대체
  - 예: `https://map.kakao.com/?q=${encodeURIComponent(restaurant_name)}`

---

## 🛠️ 구현 계획

### 1단계: 타입 정의 수정

#### 파일: `src/types/definitions.ts`

`RestaurantMenuItem` 인터페이스에 `place_url` 필드 추가:

```diff
 export interface RestaurantMenuItem {
     restaurant_id: number;
     restaurant_name: string;
     menu_id: number;
     menu_name: string;
     price: number;
     distance_m: number;
     calories_kcal: number;
     carbs_g: number;
     protein_g: number;
     fat_g: number;
     confidence: number;
+    place_url?: string;  // 카카오맵 가게 상세 URL (optional - 백엔드에서 제공하지 않을 수도 있음)
 }
```

---

### 2단계: AgentFoodItem 컴포넌트 수정

#### 파일: `src/components/agent/Mainagent.tsx`

메뉴 이름 클릭 시 `place_url`로 새 탭을 여는 로직 추가:

**방법 1 - `place_url`이 있는 경우:**

```typescript
// 메뉴 이름 부분에 클릭 이벤트 추가
<p 
  className="font-bold text-sm text-slate-800 truncate cursor-pointer hover:text-indigo-600 hover:underline"
  onClick={(e) => {
    e.stopPropagation();
    if (item.place_url) {
      window.open(item.place_url, "_blank");
    }
  }}
>
  {item.menu_name}
</p>
```

**방법 2 - `place_url`이 없는 경우 (카카오맵 검색 URL 대체):**

```typescript
<p 
  className="font-bold text-sm text-slate-800 truncate cursor-pointer hover:text-indigo-600 hover:underline"
  onClick={(e) => {
    e.stopPropagation();
    const searchUrl = `https://map.kakao.com/?q=${encodeURIComponent(item.restaurant_name)}`;
    window.open(searchUrl, "_blank");
  }}
>
  {item.menu_name}
</p>
```

---

### 3단계: agent/page.tsx 에서 onClick 연결 (현재 이미 가능)

현재 `AgentFoodItem` 에 `onClick` prop이 있으므로, 이것을 활용하는 것도 가능:

```tsx
// agent/page.tsx 내에서
<AgentFoodItem
  key={item.menu_id}
  item={item}
  isChecked={checkedItems.has(item.menu_id)}
  onCheck={() => handleCheckItem(item.menu_id)}
  onClick={() => {
    if (item.place_url) {
      window.open(item.place_url, "_blank");
    } else {
      // 대체: 카카오맵 검색
      window.open(`https://map.kakao.com/?q=${encodeURIComponent(item.restaurant_name)}`, "_blank");
    }
  }}
/>
```

> [!TIP]
> 현재 `AgentFoodItem`의 `onClick`은 카드 전체 클릭에 바인딩되어 있고, 체크박스는 `e.stopPropagation()`으로 분리되어 있음.
> 따라서 카드 전체를 클릭하면 지도가 열리고, 체크박스는 독립적으로 작동하는 UX가 됨.

---

## 📋 수정 파일 요약

| 파일 | 변경 내용 |
|---|---|
| `src/types/definitions.ts` | `RestaurantMenuItem`에 `place_url?` 필드 추가 |
| `src/components/agent/Mainagent.tsx` | 메뉴 이름 또는 카드 클릭 시 `window.open` 로직 추가 (또는 page.tsx에서 onClick prop 전달) |
| `src/app/agent/page.tsx` | `AgentFoodItem`의 `onClick` prop에 `window.open` 핸들러 연결 |

---

## ✅ 검증 방법

1. Agent 페이지에서 주소 기반 메뉴 추천 데이터 로드
2. 음식 메뉴 이름(또는 카드) 클릭
3. 새 탭에서 카카오맵 가게 상세 페이지가 열리는지 확인
4. 체크박스 클릭 시에는 지도가 열리지 않고 체크만 되는지 확인

---

## 🤔 결정이 필요한 사항

1. **백엔드에서 `place_url`을 제공하는지** 확인 → 시나리오 A or B 결정
2. **클릭 대상**: 메뉴 이름만 클릭 가능 vs 카드 전체 클릭 가능
3. **`place_url` 미제공 시** 카카오맵 검색 URL로 대체할지 여부
