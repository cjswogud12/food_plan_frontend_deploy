# 인바디 OCR 업로드 → 목표/식단 생성 플로우

## 📋 전체 플로우 개요

```
1. 프론트엔드: 이미지 업로드
   ↓
2. 백엔드: OCR 텍스트 추출
   ↓
3. 백엔드: 값 파싱 및 DB 업데이트
   ↓
4. 백엔드: 목표 생성 (UserGoal)
   ↓
5. 백엔드: 식단 계획 생성 (DietPlan)
   ↓
6. 프론트엔드: 결과 표시
```

---

## 1️⃣ 프론트엔드: 이미지 업로드

### 📤 요청 (Request)

**API 엔드포인트:**
```
POST /api/inbody-ocr
```

**헤더:**
```typescript
{
  "Authorization": "Bearer <JWT_TOKEN>",
  // Content-Type은 자동 설정 (multipart/form-data)
}
```

**요청 바디 (FormData):**
```typescript
{
  image: File  // 인바디 이미지 파일
}
```

**프론트엔드 코드 위치:**
- `src/components/InbodyUploadAndHistory.tsx` - 업로드 컴포넌트
- `src/api/index.ts` - `uploadInbodyImage()` 함수

**전송 예시:**
```typescript
const formData = new FormData();
formData.append("image", file, file.name);

const response = await uploadInbodyImage(formData, { timeoutMs: 600000 });
```

---

## 2️⃣ 백엔드: OCR 텍스트 추출

백엔드에서 이미지를 받아 OCR 처리를 수행합니다.

**처리 과정:**
1. 이미지 수신
2. OCR 엔진 (Google Vision API 등) 호출
3. 텍스트 추출
4. 다음 단계로 전달

---

## 3️⃣ 백엔드: 값 파싱 및 DB 업데이트

### 📥 파싱되는 데이터

OCR로 추출된 텍스트에서 다음 값들을 파싱합니다:

```typescript
interface InbodyParsedData {
  height: number;                    // 키 (cm)
  weight: number;                    // 몸무게 (kg)
  body_fat_mass: number;             // 체지방량 (kg)
  body_fat_pct: number;              // 체지방률 (%)
  skeletal_muscle_mass: number;      // 골격근량 (kg)
  bmr: number;                       // 기초대사량 (kcal)
  bmi?: number;                      // BMI (선택)
  visceral_fat_level: number;        // 내장지방레벨
  inbody_score: number;              // 인바디 점수
  abdominal_fat_ratio: number;       // 복부지방률
  measurement_date?: string;         // 측정일 (YYYY-MM-DD)
}
```

### 💾 DB 저장 (InBodyRecord 테이블)

```sql
INSERT INTO inbody_records (
  user_number,
  measurement_date,
  height,
  weight,
  body_fat_mass,
  body_fat_pct,
  skeletal_muscle_mass,
  bmr,
  bmi,
  visceral_fat_level,
  inbody_score,
  abdominal_fat_ratio,
  created_at
) VALUES (...)
```

---

## 4️⃣ 백엔드: 체형 분류 및 목표 생성

### 🔍 체형 분류 (Body Classification)

인바디 데이터를 기반으로 체형을 분류합니다:

**입력 데이터:**
```typescript
interface InbodyInput {
  gender: "M" | "F";
  height_cm: number;
  weight_kg: number;
  body_fat_kg: number;
  body_fat_pct: number;
  skeletal_muscle_kg: number;
  bmr_kcal?: number;
}
```

**분류 결과:**
```typescript
interface BodyClassificationResponse {
  stage1: string;           // "마름", "정상", "과체중", "비만"
  stage2: string;           // "초저체중(위험)", "근감소성비만" 등
  metrics: {
    bmi: number;
    body_fat_pct: number;
    body_fat_kg: number;
    skeletal_muscle_kg: number;
    ffm_kg: number;          // 제지방량
    ffmi: number;            // 제지방지수
    smm_ratio: number;       // 골격근비율
    bmr_per_kg: number;      // 체중당 기초대사량
  };
  reason: string;            // 분류 이유 설명
}
```

### 🎯 목표 타입 추론 (Goal Type Inference)

체형 분류 결과를 기반으로 목표 타입을 자동 추론합니다:

```typescript
// 목표 타입
type GoalType = "diet" | "maintain" | "bulk";

// 추론 로직 예시:
// - 비만 → "diet" (다이어트)
// - 정상 → "maintain" (유지)
// - 마름 + 근육량 부족 → "bulk" (벌크업)
```

### 💪 목표 칼로리 계산

```typescript
interface TargetCalorieCalculation {
  bmr: number;              // 기초대사량
  activity_level: string;   // 활동량 ("sedentary", "light", "moderate", "active", "very_active")
  goal_type: GoalType;      // 목표 타입
  
  // 계산식:
  // TDEE = BMR × 활동계수
  // - sedentary: BMR × 1.2
  // - light: BMR × 1.375
  // - moderate: BMR × 1.55
  // - active: BMR × 1.725
  // - very_active: BMR × 1.9
  
  // 목표 칼로리:
  // - diet: TDEE - 500 (하루 500kcal 적자)
  // - maintain: TDEE
  // - bulk: TDEE + 300 (하루 300kcal 흑자)
}
```

### 💾 목표 저장 (UserGoal 테이블)

```sql
INSERT INTO user_goals (
  user_number,
  goal_type,              -- "diet", "maintain", "bulk"
  target_calorie,         -- 목표 칼로리
  target_protein,         -- 목표 단백질 (g)
  target_carb,            -- 목표 탄수화물 (g)
  target_fat,             -- 목표 지방 (g)
  created_at
) VALUES (...)
```

---

## 5️⃣ 백엔드: 식단 계획 생성

### 📝 식단 생성 요청

**API 엔드포인트:**
```
POST /api/diet-plan
```

**요청 바디:**
```typescript
interface DietPlanRequest {
  user_number: number;
  id: string;              // 사용자 ID
  goal_type: string;       // "diet", "maintain", "bulk"
  target_calorie: number;  // 목표 칼로리
}
```

### 🤖 OpenAI 프롬프트 구성

```typescript
interface DietPlanPrompt {
  goal_type: string;
  target_calorie: number;
  body_type_stage1: string;      // "마름", "정상", "비만" 등
  body_type_stage2: string;      // 세부 분류
  latest_inbody: {
    height_cm: number;
    weight_kg: number;
    body_fat_pct: number;
    skeletal_muscle_kg: number;
    bmr_kcal: number;
  };
  activity_level: string;
  notes: string[];               // 식단 생성 가이드라인
}
```

### 🍽️ 식단 계획 응답

```typescript
interface DietPlanResponse {
  plan: {
    goal_type: string;
    target_calorie: number;
    body_type_stage1: string;
    body_type_stage2: string;
    note: string[];
    days: [{
      day_label: string;         // "Day 1"
      date: string;              // "2026-02-05"
      breakfast: MealItem;
      lunch: MealItem;
      dinner: MealItem;
      total_calories_kcal: number;
      total_carbs_g: number;
      total_protein_g: number;
      total_fat_g: number;
    }]
  };
  today_intake: {
    goal_type: string;
    target_calorie: number;
    total_calories_kcal: number;
    total_carbs_g: number;
    total_protein_g: number;
    total_fat_g: number;
    plan_date: string;
  }
}

interface MealItem {
  name: string;                  // 음식 이름 (예: "현미밥과 닭가슴살 샐러드")
  description: string;           // 설명
  calories_kcal: number;         // 칼로리
  carbs_g: number;              // 탄수화물
  protein_g: number;            // 단백질
  fat_g: number;                // 지방
  image_url: string;            // Pexels에서 가져온 이미지 URL
}
```

### 💾 식단 저장 (UserDietPlan 테이블)

```sql
INSERT INTO user_diet_plans (
  user_number,
  goal_type,
  target_calorie,
  plan_json,              -- 전체 식단 계획 JSON
  created_at
) VALUES (...)
```

---

## 6️⃣ 프론트엔드: 결과 표시

### 📊 상태 업데이트

업로드 성공 후 프론트엔드에서 다음 상태들을 업데이트합니다:

```typescript
// 1. 사용자 목표 업데이트
const goalRes = await getUserGoal();
const goalData = await goalRes.json();
setUserGoal(goalData);

// 2. 식단 계획 가져오기
const dietPlan = await getDietplan(
  user.user_number,
  user.id,
  goalData.goal_type,
  goalData.target_calorie
);
setDietPlan(dietPlan.days[0]);

// 3. 오늘의 섭취 정보 업데이트
setTodayIntake(dietPlan.today_intake);
```

### 🎨 UI 표시

**메인 페이지 (`src/app/page.tsx`):**
- 사용자 목표 표시
- 오늘의 섭취 정보 그래프
- 식단 계획 (아침/점심/저녁)

**마이페이지 (`src/components/mypage/MypageInbody.tsx`):**
- 인바디 기록 히스토리
- 체형 분류 결과
- 목표 정보

---

## 🔄 전체 데이터 흐름 요약

### 업로드 시점
```
프론트엔드                     백엔드
    |                           |
    | POST /api/inbody-ocr      |
    |-------------------------->|
    |   FormData(image)         |
    |                           | OCR 텍스트 추출
    |                           | ↓
    |                           | 값 파싱
    |                           | ↓
    |                           | InBodyRecord 저장
    |                           | ↓
    |                           | 체형 분류
    |                           | ↓
    |                           | 목표 타입 추론
    |                           | ↓
    |                           | UserGoal 저장
    |                           | ↓
    |        200 OK             | (완료)
    |<--------------------------|
    |   { success: true }       |
```

### 식단 조회 시점
```
프론트엔드                     백엔드
    |                           |
    | GET /api/user/goal        |
    |-------------------------->|
    |                           | UserGoal 조회
    |        UserGoal           |
    |<--------------------------|
    |                           |
    | POST /api/diet-plan       |
    |-------------------------->|
    |   { user_number,          |
    |     goal_type,            |
    |     target_calorie }      |
    |                           | OpenAI 식단 생성
    |                           | ↓
    |                           | Pexels 이미지 첨부
    |                           | ↓
    |                           | UserDietPlan 저장
    |        DietPlan           |
    |<--------------------------|
    |   { plan, today_intake }  |
```

---

## 🔑 핵심 포인트

### 1. 인증
- 모든 API 요청에 JWT 토큰 필요
- `Authorization: Bearer <token>` 헤더 사용

### 2. 자동화
- 인바디 업로드 → 목표 자동 생성
- 체형 분류 → 목표 타입 자동 추론
- 목표 칼로리 자동 계산

### 3. 데이터 의존성
```
InBodyRecord (필수)
    ↓
UserGoal (자동 생성)
    ↓
DietPlan (목표 기반 생성)
```

### 4. 에러 처리
- 인바디 기록 없음 → 404 에러
- 목표 없음 → 자동 생성 또는 기본값 사용
- OpenAI API 실패 → 500 에러

---

## 📝 관련 파일

### 프론트엔드
- `src/components/InbodyUploadAndHistory.tsx` - 업로드 UI
- `src/api/index.ts` - API 호출 함수
- `src/app/page.tsx` - 메인 페이지 (식단 표시)
- `src/types/definitions.ts` - 타입 정의
- `src/store/index.ts` - 전역 상태 관리

### 백엔드 (참고용)
- `/api/inbody-ocr` - OCR 처리
- `/api/user/goal` - 목표 조회/생성
- `/api/diet-plan` - 식단 생성
- `/api/classify/bodytype` - 체형 분류
