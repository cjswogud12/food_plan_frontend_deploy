# 에이전트 페이지 식당/메뉴 데이터 연동 구현 계획

## 목표

`src/app/agent/page.tsx`의 Carousel 카드 안에 있는 `<PlaceholderFoodItem />` (빈 깡통)을
백엔드 API(`fetchNearbyRestaurants`)에서 가져온 실제 식당/메뉴 데이터로 교체한다.

## 현재 상태 분석

### 현재 구조

- `agent/page.tsx`에서 아침/점심/저녁 Carousel 카드마다 `<PlaceholderFoodItem />` 3개가 하드코딩되어 있음
- `fetchNearbyRestaurants` → `POST /api/node/run` (주소, 위경도, 반경 전송)
- `selectMenuItem` → `POST /api/node/select` (메뉴 선택/교체)
- `Restaurant` 인터페이스가 `definitions.ts`에 정의되어 있음

### 백엔드 응답 데이터 구조 (`Restaurant`)

```
Restaurant
├── label: string (집/회사)
├── restaurants: [{
│   ├── name: string (음식점 이름)
│   ├── category: string
│   ├── distance_m: number
│   ├── place_url: string
│   └── menus: [{
│       ├── name: string (메뉴명) ← 카드에 표시
│       ├── price: string (가격) ← 카드에 표시
│       └── nutrition: {
│           ├── calories_kcal: number (칼로리) ← 카드에 표시
│           ├── carbs_g, protein_g, fat_g ...
│           └── confidence: number (신뢰도)
│       }
│   }]
├── }]
└── error: [string]
```

### 카드 UI에 표시할 정보 (사진 기준)

각 메뉴 아이템마다:

1. **체크박스** (왼쪽)
2. **음식 이미지** (플레이스홀더)
3. **메뉴명** (`menus.name`)
4. **칼로리** (`menus.nutrition.calories_kcal` kcal)
5. **가격** (`menus.price`)

---

## 구현 계획

### 1단계: 컴포넌트 생성

#### [NEW] `src/components/agent/Mainagent.tsx`

실제 메뉴 데이터를 표시하는 음식 아이템 컴포넌트를 만든다.

**Props 설계:**

```typescript
interface AgentFoodItemProps {
  menuName: string;        // 메뉴명
  caloriesKcal: number;    // 칼로리
  price: string;           // 가격
  restaurantName: string;  // 음식점 이름
  isChecked: boolean;      // 체크 상태
  onCheck: () => void;     // 체크 핸들러
  onClick: () => void;     // 클릭 핸들러 (상세보기 등)
}
```

**컴포넌트 내용:**

- `PlaceholderFoodItem`과 동일한 레이아웃 유지
- 빈 회색 블록 대신 실제 텍스트로 교체:
  - 메뉴명 (bold)
  - `{calories_kcal} kcal` 표시
  - `{price}` 표시
- 체크박스는 `isChecked` prop으로 토글
- 이미지 영역은 우선 플레이스홀더 유지 (백엔드에 이미지 필드 없음)

### 2단계: `agent/page.tsx` 수정

1. **API 호출 추가**: 페이지 로드 시 또는 사용자 주소 입력 시 `fetchNearbyRestaurants` 호출
2. **상태 관리**: `Restaurant` 데이터를 `useState`로 관리

   ```typescript
   const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
   const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
   ```

3. **Carousel 카드 내부 교체**:
   - `<PlaceholderFoodItem />` 3개 → `restaurantData`의 메뉴 목록을 `<Mainagent />` 컴포넌트로 렌더링
   - 데이터가 없으면 기존 `PlaceholderFoodItem` 유지 (로딩/폴백)

### 3단계: 데이터 매핑 로직

```
fetchNearbyRestaurants 응답
  → Restaurant.restaurants[] 배열에서 각 식당의 menus[] 추출
  → 각 menu 아이템을 AgentFoodItemProps에 매핑하여 Carousel 카드에 렌더링
```

**매핑 예시:**

```
restaurants[0].menus[0].name       → menuName
restaurants[0].menus[0].nutrition.calories_kcal → caloriesKcal
restaurants[0].menus[0].price      → price
restaurants[0].name                → restaurantName
```

---

## 파일 변경 요약

| 파일 | 작업 | 설명 |
|---|---|---|
| `src/components/agent/Mainagent.tsx` | **[NEW]** | 실제 메뉴 데이터를 표시하는 음식 아이템 컴포넌트 |
| `src/app/agent/page.tsx` | **[MODIFY]** | `fetchNearbyRestaurants` API 호출 추가, `PlaceholderFoodItem` → `Mainagent` 교체 |

---

## 확인 필요 사항

1. **`fetchNearbyRestaurants` 호출 시점**: 페이지 로드 시 자동 호출? 아니면 사용자가 주소를 입력한 뒤 호출?
   - `address_text`, `lat`, `lng`, `radius_m`을 어디서 가져올지 결정 필요
2. **식단 타입(아침/점심/저녁)별 데이터 구분**: 백엔드 응답에서 meal_type 구분이 있는지, 아니면 동일한 데이터를 3개 카드에 공유하는지
3. **`selectMenuItem` 호출 시점**: 체크박스 클릭 시 호출? 아니면 별도 버튼?

---

## 검증 계획

### 수동 검증

1. `npm run dev`로 개발 서버 실행 후 `/agent` 페이지 접속
2. Carousel 카드에 빈 깡통 대신 실제 메뉴 데이터(메뉴명, 칼로리, 가격)가 표시되는지 확인
3. 백엔드 미응답/에러 시 PlaceholderFoodItem이 폴백으로 표시되는지 확인
