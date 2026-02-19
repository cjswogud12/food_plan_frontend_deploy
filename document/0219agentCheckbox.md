# Agent 페이지 - 체크박스 → 기록 페이지 연동 개발 계획

> 작성일: 2026-02-19

## 📌 목표

Agent 페이지에서 식단 메뉴를 체크하면, 해당 음식의 영양 정보(칼로리, 탄단지)가 **기록(Record) 페이지**의 해당 끼니(아침/점심/저녁)에 자동으로 표시되고 합산되도록 연동.

---

## 🔍 현재 문제 분석

### 핵심 원인: Agent 페이지의 체크가 Zustand Store에 저장되지 않음

```
[현재 동작]
Agent 페이지 체크 → 로컬 Set<number>에 menu_id만 저장 → Store에 반영 안 됨 → Record 페이지에서 읽을 수 없음

[의도한 동작]
Agent 페이지 체크 → Zustand Store(checkedMeals)에 음식 데이터 저장 → Record 페이지에서 읽어서 표시
```

### 상세 원인 분석

#### 1. Agent 페이지 (`src/app/agent/page.tsx`)

```typescript
// 현재 코드 - 로컬 Set에만 저장, store에 저장 안 함!
const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

const handleCheckItem = (menuId: number) => {
  setCheckedItems(prev => {
    const next = new Set(prev);
    if (next.has(menuId)) next.delete(menuId);
    else next.add(menuId);
    return next;
  });
};
```

- `checkedItems`는 **로컬 useState**로 `menu_id` 숫자만 관리
- Zustand store의 `toggleMealCheck`을 **전혀 호출하지 않음**
- checkedMeals를 store에서 import하고 있지만 **UI용으로만 사용** (인사말 표시)

#### 2. Zustand Store (`src/store/index.ts`)

```typescript
toggleMealCheck: (date, mealType, food) => {
  const foodId = food.food_name || food.name;  // ← food_name으로 중복 체크
  // ...
}
```

- `food.food_name || food.name`으로 중복 체크
- 하지만 `RestaurantMenuItem`의 이름 필드는 **`menu_name`** → **필드명 불일치!**

#### 3. Record 페이지 (`src/app/record/page.tsx`) - 이쪽은 이미 구현 완료

```typescript
const checkedForDate = checkedMeals[dateString] || { breakfast: [], lunch: [], dinner: [] };

const combinedMealData = {
  breakfast: [...mealData.breakfast, ...addPlanFlag(checkedForDate.breakfast || [])],
  lunch: [...mealData.lunch, ...addPlanFlag(checkedForDate.lunch || [])],
  dinner: [...mealData.dinner, ...addPlanFlag(checkedForDate.dinner || [])],
  snack: mealData.snack,
};
```

- Store의 `checkedMeals`를 읽어서 API 데이터와 합쳐 표시
- 칼로리 합산도 `calories_kcal` fallback 포함 → **이 부분은 정상 작동 가능**

#### 4. 영양소 합산 필드명 매핑 (Record 페이지)

```typescript
// Record 페이지의 합산 로직에서 사용하는 fallback 필드명들
totalCalories: r.estimated_calorie_kcal ?? r.food_calories ?? r.calories ?? r.calories_kcal
totalCarbs: r.estimated_carb_g ?? r.food_carb ?? r.carbohydrate ?? r.carbs_g
totalProteins: r.estimated_protein_g ?? r.food_protein ?? r.protein ?? r.protein_g
totalFats: r.estimated_fat_g ?? r.food_fat ?? r.food_fats ?? r.fat ?? r.fat_g
```

- `RestaurantMenuItem`의 필드: `calories_kcal`, `carbs_g`, `protein_g`, `fat_g`
- Record 페이지의 fallback에 **이미 포함**되어 있음 ✅

---

## 🛠️ 수정 계획

### 1단계: Agent 페이지 체크 핸들러 수정

#### 파일: `src/app/agent/page.tsx`

**문제**: `handleCheckItem`이 store의 `toggleMealCheck`을 호출하지 않음

**수정 내용**:

1. Store에서 `toggleMealCheck` 가져오기
2. 체크 시 어떤 끼니(breakfast/lunch/dinner)인지 파악
3. `toggleMealCheck`에 날짜, 끼니타입, 음식 데이터를 함께 전달

```typescript
// 변경 전
const { todayIntake, setTodayIntake, checkedMeals, resetDiet, currentMealSlide, setCurrentMealSlide } = useDietStore();

// 변경 후 - toggleMealCheck 추가
const { todayIntake, setTodayIntake, checkedMeals, toggleMealCheck, resetDiet, currentMealSlide, setCurrentMealSlide } = useDietStore();
```

```typescript
// 변경 전 - 로컬 Set만 관리
const handleCheckItem = (menuId: number) => {
  setCheckedItems(prev => {
    const next = new Set(prev);
    if (next.has(menuId)) next.delete(menuId);
    else next.add(menuId);
    return next;
  });
};

// 변경 후 - store에도 데이터 저장
const handleCheckItem = (menuId: number, mealType: "breakfast" | "lunch" | "dinner", item: RestaurantMenuItem) => {
  // 1. UI용 로컬 체크 상태 토글
  setCheckedItems(prev => {
    const next = new Set(prev);
    if (next.has(menuId)) next.delete(menuId);
    else next.add(menuId);
    return next;
  });

  // 2. Store에 음식 데이터 저장 → Record 페이지 연동
  const foodData = {
    food_name: item.menu_name,        // toggleMealCheck에서 food_name으로 중복 체크
    calories_kcal: item.calories_kcal, // Record 페이지 합산 fallback에 포함됨
    carbs_g: item.carbs_g,
    protein_g: item.protein_g,
    fat_g: item.fat_g,
    restaurant_name: item.restaurant_name,
    price: item.price,
  };
  toggleMealCheck(today, mealType, foodData);
};
```

**JSX 부분 수정** (AgentFoodItem 호출 시 mealType과 item 전달):

```tsx
// 변경 전
<AgentFoodItem
  key={item.menu_id}
  item={item}
  isChecked={checkedItems.has(item.menu_id)}
  onCheck={() => handleCheckItem(item.menu_id)}
/>

// 변경 후 - meal.key와 item 전달
<AgentFoodItem
  key={item.menu_id}
  item={item}
  isChecked={checkedItems.has(item.menu_id)}
  onCheck={() => handleCheckItem(item.menu_id, meal.key, item)}
/>
```

---

### 요약: Store의 toggleMealCheck 필드명 매핑

| Store toggleMealCheck 내부 | RestaurantMenuItem 원본 | 변환 필요 |
|---|---|---|
| `food.food_name \|\| food.name` (중복체크용) | `menu_name` | ✅ `food_name: item.menu_name`으로 변환 |
| `food.calories \|\| food.food_calories` (intake 업데이트) | `calories_kcal` | ⚠️ Store 측에서 `calories_kcal` fallback 필요할 수 있음 |

---

## ⚠️ 추가 확인 필요 사항

### Store의 `toggleMealCheck` 내 todayIntake 업데이트 로직

```typescript
// 현재 store 코드
total_calories_kcal: ... + (food.calories || food.food_calories || 0),
total_carbs_g: ... + (food.carbs || food.food_carbs || 0),
total_protein_g: ... + (food.protein || food.food_proteins || 0),
total_fat_g: ... + (food.fat || food.food_fats || 0),
```

`RestaurantMenuItem`의 필드명(`calories_kcal`, `carbs_g`, `protein_g`, `fat_g`)이 store의 fallback 목록에 **포함되지 않아** todayIntake 업데이트가 0으로 들어갈 수 있음.

**해결 방법 (2가지 중 택 1)**:

- **A방법**: Agent에서 store에 넘길 때 필드명을 store가 기대하는 형태로 매핑 (위 코드에서 이미 반영)
- **B방법**: Store의 `toggleMealCheck`에 fallback 필드명 추가 (`calories_kcal`, `carbs_g` 등)

→ **A방법 추천** (store 수정 없이 agent 페이지에서만 변환)

---

## 📋 수정 파일 요약

| 파일 | 변경 내용 |
|---|---|
| `src/app/agent/page.tsx` | `handleCheckItem`에서 `toggleMealCheck` 호출 추가 + 필드명 매핑 |

> store, record 페이지는 수정 불필요 (이미 연동 로직 구현 완료)

---

## ✅ 검증 방법

1. Agent 페이지에서 아침/점심/저녁 메뉴 체크박스 클릭
2. 기록(Record) 페이지로 이동
3. 오늘 날짜 선택 시 체크한 음식이 해당 끼니에 표시되는지 확인
4. 칼로리/탄수화물/단백질/지방 합산이 정상적으로 반영되는지 확인
5. 체크 해제 후 기록 페이지에서 제거되는지 확인
