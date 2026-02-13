# 에이전트 페이지 (`src/app/agent/page.tsx`) API 연동 문서

이 문서는 에이전트 페이지에서 사용되는 백엔드 API 엔드포인트와 각 API의 역할을 정리한 것입니다.
메인 페이지와 동일한 구조를 가지고 있어, 사용하는 API 세트도 동일합니다.

## 1. 사용자 정보 조회 (`getUser`)

- **함수명**: `getUser(id)`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/user`
- **Query Parameters**:
  - `id`: 사용자 ID (string)
- **설명**: 현재 로그인한 사용자의 기본 정보(이름, 사용자 번호 등)를 가져옵니다.

## 2. 사용자 목표 조회 (`getUserGoal`)

- **함수명**: `getUserGoal()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/user/goal`
- **Query Parameters**: 없음
- **설명**: 사용자가 설정한 다이어트 목표(감량/유지/증량)와 하루 목표 칼로리를 조회합니다.

## 3. 식단 계획 생성 및 조회 (`getDietplan`)

- **함수명**: `getDietplan(user_number, id, goal_type, target_calorie)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/diet-plan`
- **Request Body (JSON)**:
  - `user_number`: 사용자 고유 번호 (number)
  - `id`: 사용자 ID (string)
  - `goal_type`: 목표 타입 (string)
  - `target_calorie`: 목표 칼로리 (number)
- **설명**: 사용자의 목표와 정보를 바탕으로 오늘의 아침/점심/저녁 식단 계획을 생성하거나 조회합니다.

## 4. 오늘의 섭취량 조회 (`getTodayIntake`)

- **함수명**: `getTodayIntake()`
- **HTTP Method**: `GET`
- **Endpoint**: `/api/intake/today`
- **Query Parameters**: 없음
- **설명**: 오늘 하루 동안 섭취한 총 칼로리 및 탄수화물, 단백질, 지방 섭취량을 조회합니다.

## 5. 주변 식당 검색 (`getNearbyPlaces`)

- **함수명**: `getNearbyPlaces(foodName, lat, lng, radius)`
- **HTTP Method**: `POST`
- **Endpoint**: `/api/diet-plan/places`
- **Request Body (JSON)**:
  - `food_name`: 검색할 음식 이름 (string)
  - `lat`: 위도 (number)
  - `lng`: 경도 (number)
  - `radius_m`: 검색 반경 (number, 기본값 2000m)
- **설명**: 지도 모달에서 특정 메뉴를 판매하는 주변 식당 정보를 검색합니다.

---

### 참고 사항

- 모든 API 요청은 `Authorization` 헤더에 Bearer Token을 포함하여 인증된 상태로 호출됩니다.
- `handleAddMenu` 함수는 현재 API가 연결되어 있지 않으며, 추후 식단 직접 추가 기능 구현 시 엔드포인트 연결이 필요합니다.
