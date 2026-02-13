# 에이전트 페이지 식당/메뉴 데이터 연동 구현 계획

## 목표

`src/app/agent/page.tsx`의 Carousel 카드 안에 있는 `<PlaceholderFoodItem />` (빈 깡통)을
백엔드 API(`fetchMenuSave`)에서 가져온 실제 식당/메뉴 데이터로 교체한다.

## 현재 상태 분석

### 현재 구조

- `agent/page.tsx`에서 아침/점심/저녁 Carousel 카드마다 `<PlaceholderFoodItem />` 3개가 하드코딩되어 있음
- `fetchMenuSave` → `POST /api/recommand/menu-save` (label, 주소, 위경도, 반경 전송)
- `selectMenuItem` → `POST /api/node/select` (메뉴 선택/교체)
- `Restaurant`, `RestaurantMenuItem` 인터페이스가 `definitions.ts`에 정의되어 있음

### 백엔드 응답 데이터 구조

```
Restaurant (응답 전체)
├── goal_type: string
├── tdee_kcal: number
├── daily_target_kcal: number
├── meal_target_kcal: {
│   ├── breakfast: number (아침 목표 칼로리)
│   ├── lunch: number (점심 목표 칼로리)
│   └── dinner: number (저녁 목표 칼로리)
│ }
├── used_radius_m: number
├── collector_triggered: boolean
├── breakfast: RestaurantMenuItem[] ← 아침 카드에 렌더링
├── lunch: RestaurantMenuItem[]     ← 점심 카드에 렌더링
└── dinner: RestaurantMenuItem[]    ← 저녁 카드에 렌더링

RestaurantMenuItem (각 메뉴 아이템)
├── restaurant_id: number
├── restaurant_name: string  ← 카드에 표시 (음식점명)
├── menu_id: number
├── menu_name: string        ← 카드에 표시 (메뉴명)
├── price: number            ← 카드에 표시 (가격)
├── distance_m: number       ← 카드에 표시 (거리)
├── calories_kcal: number    ← 카드에 표시 (칼로리)
├── carbs_g: number
├── protein_g: number
├── fat_g: number
└── confidence: number
```

### 카드 UI에 표시할 정보 (사진 기준)

각 메뉴 아이템마다:

1. **체크박스** (왼쪽)
2. **음식 이미지** (플레이스홀더 유지 — 이미지 필드 없음)
3. **메뉴명** (`menu_name`)
4. **칼로리** (`calories_kcal` kcal)
5. **가격** (`price` 원)

---

## 구현 계획

### 1단계: 컴포넌트 생성

#### [NEW] `src/components/agent/Mainagent.tsx`

실제 메뉴 데이터를 표시하는 음식 아이템 컴포넌트를 만든다.

**Props 설계:**

```typescript
interface AgentFoodItemProps {
  item: RestaurantMenuItem;  // 메뉴 아이템 데이터 전체
  isChecked: boolean;        // 체크 상태
  onCheck: () => void;       // 체크 핸들러
  onClick: () => void;       // 클릭 핸들러 (상세보기 등)
}
```

**컴포넌트 내용:**

- `PlaceholderFoodItem`과 동일한 레이아웃 유지
- 빈 회색 블록 대신 실제 텍스트로 교체:
  - 메뉴명 (`item.menu_name`, bold)
  - 음식점명 (`item.restaurant_name`, 서브텍스트)
  - `{item.calories_kcal} kcal` 표시
  - `{item.price}원` 표시
- 체크박스는 `isChecked` prop으로 토글
- 이미지 영역은 우선 플레이스홀더 유지 (백엔드에 이미지 필드 없음)

### 2단계: `agent/page.tsx` 수정

1. **API 호출 추가**: 페이지 로드 시 `fetchMenuSave` 호출 (label은 'home' 또는 'company' 등 상황에 맞게 전달)
2. **상태 관리**: `Restaurant` 데이터를 `useState`로 관리

   ```typescript
   const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
   const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
   ```

3. **Carousel 카드 내부 교체**:
   - 아침 카드: `restaurantData.breakfast[]` → `<Mainagent />` 컴포넌트로 렌더링
   - 점심 카드: `restaurantData.lunch[]` → `<Mainagent />` 컴포넌트로 렌더링
   - 저녁 카드: `restaurantData.dinner[]` → `<Mainagent />` 컴포넌트로 렌더링
   - 데이터가 없으면 기존 `PlaceholderFoodItem` 유지 (로딩/폴백)

### 3단계: 데이터 매핑 로직

**매핑이 매우 단순해짐!** 백엔드 응답에서 `breakfast`, `lunch`, `dinner` 배열이 이미 식사별로 분리되어 있으므로:

```
restaurantData.breakfast[0] → <Mainagent item={restaurantData.breakfast[0]} />
restaurantData.breakfast[1] → <Mainagent item={restaurantData.breakfast[1]} />
restaurantData.breakfast[2] → <Mainagent item={restaurantData.breakfast[2]} />
```

각 `RestaurantMenuItem`의 필드가 바로 사용됨:

```
item.menu_name         → 메뉴명
item.restaurant_name   → 음식점 이름
item.calories_kcal     → 칼로리
item.price             → 가격
item.distance_m        → 거리
```

---

## 파일 변경 요약

| 파일 | 작업 | 설명 |
|---|---|---|
| `src/components/agent/Mainagent.tsx` | **[NEW]** | 실제 메뉴 데이터를 표시하는 음식 아이템 컴포넌트 |
| `src/app/agent/page.tsx` | **[MODIFY]** | `fetchMenuSave` API 호출 추가, `PlaceholderFoodItem` → `Mainagent` 교체 |

---

## 확인 필요 사항

1. **`fetchMenuSave` 호출 시점**: 페이지 로드 시 자동 호출?
   - `label`, `address_text`, `lat`, `lng`, `radius_m` 파라미터 필요
2. **`selectMenuItem` 호출 시점**: 체크박스 클릭 시 호출? 아니면 별도 버튼?

---

## 검증 계획

### 수동 검증

1. `npm run dev`로 개발 서버 실행 후 `/agent` 페이지 접속
2. Carousel 카드에 빈 깡통 대신 실제 메뉴 데이터(메뉴명, 칼로리, 가격)가 표시되는지 확인
3. 백엔드 미응답/에러 시 PlaceholderFoodItem이 폴백으로 표시되는지 확인
