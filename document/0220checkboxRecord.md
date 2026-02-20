# 체크박스 → 백엔드 기록 저장 기능 구현 계획

## 배경

현재 메인 페이지에서 식단 메뉴를 체크(먹었다고 표시)하면 **Zustand + localStorage**에만 저장됨.
브라우저 데이터가 날아가면 기록도 사라짐.
이제 체크 시 **백엔드 DB에도 저장**하여, 캘린더에서 해당 날짜를 눌러 기록을 확인할 수 있도록 한다.

---

## 엔드포인트 정보

| 항목 | 내용 |
|------|------|
| URL | `POST /api/recommend/menu-save` |
| 비고 | 기존 `fetchMenuSave` 함수가 이 엔드포인트를 사용 중 (식당 검색용). **새 함수를 별도로 만들어야 함** |

### Request

```json
{
  "label": "home",
  "radius_m": 1000,
  "record_date": "2026-02-20",
  "meals": [
    { "meal_type": "lunch", "menu_id": 1357, "checked": true },
    { "meal_type": "dinner", "menu_id": 1358, "checked": false }
  ]
}
```

### Response

```json
{
  "record_ids": [10]
}
```

---

## 현재 흐름 분석

```
[메인 page.tsx] handleCheckItem()
  → toggleMealCheck(today, mealType, foodData)   ← Store에 저장 (localStorage)
  → checkedItems (useMemo)                        ← UI 반영

[record/page.tsx]
  → checkedMeals[날짜]를 읽어서 mealData와 합산   ← 캘린더 기록에 표시
```

**문제**: 백엔드에 전송하는 로직이 없음 → DB에 기록이 안 됨

---

## 수정 대상 파일 검토

| 파일 | 수정 필요 | 이유 |
|------|-----------|------|
| `api/index.ts` | ✅ | 체크 상태 저장 API 함수 추가 (`saveMenuCheck`) |
| `types/definitions.ts` | ✅ | Request/Response 타입 추가 |
| `page.tsx` (메인) | ✅ | `handleCheckItem`에서 API 호출 추가 |
| `store/index.ts` | ❌ | 기존 `toggleMealCheck` 로직 그대로 유지 (로컬 상태 관리는 계속 필요) |
| `record/page.tsx` | ❌ | 백엔드에서 저장된 기록은 기존 `fetchRecords`(`getRecord`)로 이미 불러옴. 체크된 음식이 DB에 저장되면 자동으로 표시됨. **단, 중복 방지 로직 필요** |

> [!IMPORTANT]
> `record/page.tsx`에서 현재 `checkedMeals`(로컬) + `mealData`(API)를 합산하고 있음.
> 백엔드에 저장이 되면 `getRecord`로 가져오는 데이터에도 포함되므로 **중복 표시** 될 수 있음.
> 이에 대한 처리가 필요함 (아래 상세 설명).

---

## 상세 변경 계획

### 1. `types/definitions.ts` — 타입 추가

```typescript
// 체크 기록 저장 Request
export interface MenuCheckRequest {
  label: string;                    // "home" | "company"
  radius_m: number;
  record_date: string;              // "YYYY-MM-DD"
  meals: MenuCheckItem[];
}

export interface MenuCheckItem {
  meal_type: "breakfast" | "lunch" | "dinner";
  menu_id: number;
  checked: boolean;
}

// 체크 기록 저장 Response
export interface MenuCheckResponse {
  record_ids: number[];
}
```

---

### 2. `api/index.ts` — API 함수 추가

```typescript
// --- 식단 체크 기록 저장 ---
export async function saveMenuCheck(data: MenuCheckRequest): Promise<Response> {
  return postJson("/recommend/menu-save", data);
}
```

> [!NOTE]
> 기존 `fetchMenuSave`는 식당 검색용으로 유지. 새 함수 `saveMenuCheck`를 별도로 추가.
> 같은 엔드포인트(`/recommend/menu-save`)를 사용하지만 payload 구조가 다름 (meals 배열 포함 여부).

---

### 3. `page.tsx` (메인) — `handleCheckItem`에 API 호출 추가

**현재 코드:**

```typescript
const handleCheckItem = (menuId, mealType, item) => {
  const foodData = { ... };
  toggleMealCheck(today, mealType, foodData);  // 로컬만 저장
};
```

**변경 후:**

```typescript
const handleCheckItem = (menuId, mealType, item) => {
  const foodData = { ... };
  toggleMealCheck(today, mealType, foodData);  // 1. 로컬 저장 (즉시 UI 반영)

  // 2. 백엔드에도 저장 (비동기, UI 블로킹 없음)
  const isNowChecked = !checkedItems.has(menuId);  // 토글 전 상태 기준
  saveMenuCheck({
    label: locationMode,
    radius_m: 500,
    record_date: today,
    meals: [{ meal_type: mealType, menu_id: menuId, checked: isNowChecked }]
  }).catch(err => console.error("체크 저장 실패:", err));
};
```

---

### 4. `record/page.tsx` — 중복 방지 처리

**현재 문제:**

- `checkedMeals` (로컬)에서 체크된 음식 + `getRecord` (API)에서 가져온 기록 → 합산 → **같은 음식 2번 표시**

**해결 방안: 2가지 선택지**

#### 방안 A: record 페이지에서 checkedMeals 합산 로직 제거 (추천 ✅)

- 백엔드에 저장이 되므로, `getRecord`로 가져오면 이미 포함됨
- `combinedMealData`에서 `checkedForDate` 합산 부분을 삭제

```diff
- const combinedMealData = {
-   breakfast: [...mealData.breakfast, ...addPlanFlag(checkedForDate.breakfast || [])],
-   lunch: [...mealData.lunch, ...addPlanFlag(checkedForDate.lunch || [])],
-   dinner: [...mealData.dinner, ...addPlanFlag(checkedForDate.dinner || [])],
-   snack: mealData.snack,
- };
+ const combinedMealData = mealData;  // API 데이터만 사용
```

#### 방안 B: 중복 필터링 로직 추가

- `menu_id` 기준으로 이미 API 데이터에 있는 항목은 checkedMeals에서 제외

> [!WARNING]
> **방안 A를 선택하면**, 체크 직후에 record 페이지로 이동하면 백엔드 저장이 완료되기 전이라 잠깐 안 보일 수 있음.
> 하지만 실제 사용 패턴에서는 큰 문제 없을 것으로 예상. (새로고침하면 보임)
> **방안 B를 선택하면**, 양쪽 데이터를 대조해야 하므로 로직이 복잡해짐.

---

## 파일별 작업 순서

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `types/definitions.ts` | `MenuCheckRequest`, `MenuCheckItem`, `MenuCheckResponse` 타입 추가 |
| 2 | `api/index.ts` | `saveMenuCheck` 함수 추가 |
| 3 | `page.tsx` | `handleCheckItem`에 `saveMenuCheck` 호출 추가 + import 추가 |
| 4 | `record/page.tsx` | 중복 방지 처리 (방안 A 또는 B 선택 필요) |

---

## 검증 방법

1. 메인 페이지에서 식단 메뉴 체크 → 브라우저 개발자 도구 Network 탭에서 `/api/recommend/menu-save` POST 요청 확인
2. 요청 payload에 `meals` 배열과 `record_date`가 정상적으로 들어가는지 확인
3. 응답에 `record_ids`가 반환되는지 확인
4. 기록 페이지에서 해당 날짜 선택 → 체크한 음식이 표시되는지 확인
5. 체크 해제 후 다시 확인 → `checked: false`로 요청이 가는지 확인
