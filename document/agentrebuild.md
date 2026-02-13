# 에이전트 페이지 사용 API 명세 (`agentrebuild.md`)

`src/app/agent/page.tsx` 페이지에서 사용되는 모든 백엔드 API 목록입니다.

---

## 1. 사용자 정보 조회 (`getUser`)

- **함수명**: `getUser(userId: string)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/user?id={userId}`
- **설명**: 현재 로그인한 사용자의 기본 프로필 정보(user_number, username, height, weight 등)를 가져옵니다.
- **파라미터**:
  - `userId`: 로그인한 사용자의 ID (문자열)
- **반환 데이터**:

  ```json
  {
    "user_number": 1,
    "id": "test_user",
    "username": "홍길동",
    "gender": 1,
    "height": 175,
    "current_weight": 70,
    "target_weight": 65,
    ...
  }
  ```

## 2. 사용자 목표 조회 (`getUserGoal`)

- **함수명**: `getUserGoal()` (내부적으로 user_number 사용)
- **HTTP Method**: `GET`
- **Endpoint**: `/api/user/goal`
- **설명**: 사용자의 현재 목표(다이어트, 벌크업 등)와 목표 칼로리 정보를 가져옵니다.
- **파라미터**: 없음 (쿼리 파라미터로 user_number 전달)
- **반환 데이터**:

  ```json
  {
    "goal_type": "diet",
    "target_calorie": 2000,
    ...
  }
  ```

## 3. 식단 계획 조회 (`getDietplan`)

- **함수명**: `getDietplan(user_number, user_id, goal_type, target_calorie)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/diet-plan`
- **설명**: 사용자의 목표와 신체 정보를 바탕으로, AI가 생성한(또는 캐시된) 식단 계획을 가져옵니다.
- **Body**:

  ```json
  {
    "user_number": 1,
    "user_id": "test_user",
    "goal_type": "diet",
    "target_calorie": 2000
  }
  ```

- **반환 데이터**: 식단 계획 객체 (`DietPlanResponse` 참조)

## 4. 오늘의 섭취량 조회 (`getTodayIntake`)

- **함수명**: `getTodayIntake()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/intake/today`
- **설명**: 오늘 사용자가 섭취한 총 칼로리와 탄단지 영양소 섭취량을 가져옵니다.
- **반환 데이터**:

  ```json
  {
    "total_calories_kcal": 1500,
    "total_carbs_g": 200,
    "total_protein_g": 100,
    "total_fat_g": 50
  }
  ```

## 5. 특정 메뉴 주변 식당 검색 (`getNearbyPlaces`) - (모달용)

- **함수명**: `getNearbyPlaces(food_name, lat, lng)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/diet-plan/places`
- **설명**: 사용자가 특정 메뉴를 클릭했을 때, 해당 메뉴를 파는 주변 식당을 지도 모달에 표시하기 위해 검색합니다.
- **Body**:

  ```json
  {
    "query": "김치찌개",
    "x": "126.97792",
    "y": "37.56637"
  }
  ```

- **반환 데이터**: 카카오 맵 검색 결과 (`place` 배열 등)

## 6. 에이전트 맞춤 식단/식당 추천 (`fetchMenuSave`) - (핵심 기능)

- **함수명**: `fetchMenuSave(label, address_text, lat, lng, radius_m)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/recommand/menu-save`
- **설명**: 사용자의 위치(집/회사)를 기반으로 **아침/점심/저녁별 맞춤 메뉴와 식당**을 추천합니다.
- **Body**:

  ```json
  {
    "label": "home",
    "address_text": "서울 중구 세종대로 110",
    "lat": 37.56637,
    "lng": 126.97792,
    "radius_m": 500
  }
  ```

- **반환 데이터** (`Restaurant` 타입):

  ```json
  {
    "meal_target_kcal": { "breakfast": 500, "lunch": 700, "dinner": 600 },
    "breakfast": [ { "menu_name": "...", "restaurant_name": "...", ... } ],
    "lunch": [ ... ],
    "dinner": [ ... ]
  }
  ```
