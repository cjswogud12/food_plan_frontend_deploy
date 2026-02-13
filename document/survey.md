# TDEE 활동계수 설문 페이지 구현 계획

## 목표

인바디 온보딩 이후, TDEE 계산에 필요한 **활동 수준 계수**를 사용자에게 선택받는 설문 페이지를 만든다.
선택된 계수는 백엔드로 전달되어 칼로리 계산에 반영된다.

---

## 사용자 흐름

```
회원가입/로그인 → 인바디 등록 (업로드 or 건너뛰기) → [NEW] TDEE 설문 → 메인 화면(/)
```

---

## 활동 수준 선택지 (5개)

| 활동 수준 | 계수 | 설명 |
|---|---|---|
| 거의 운동 안 함 | 1.2 | 주로 앉아서 생활하며 운동을 거의 하지 않음 |
| 가벼운 활동 | 1.375 | 주 1~3회 가벼운 운동 |
| 보통 활동 | 1.55 | 주 3~5회 적당한 강도의 운동 |
| 매우 활동적 | 1.725 | 주 6~7회 강도 높은 운동 |
| 선수급 활동 | 1.9 | 하루에 2회 이상 고강도 훈련, 육체노동직 |

---

## 구현 사항

### 1. 페이지 생성

#### [NEW] `src/app/onboarding/survey/page.tsx`

**UI 구성:**

- 상단 헤더: "활동 수준 선택"
- 안내 문구: "정확한 칼로리 계산을 위해 활동 수준을 선택해주세요"
- 5개 선택지 카드 (라디오 버튼 스타일)
  - 각 카드에 활동 수준명, 계수, 설명 표시
  - 선택 시 인디고 색상 하이라이트
- 하단 확인 버튼: 선택 완료 시 활성화 → 클릭하면 메인 화면(`/`)으로 이동

**상태 관리:**

```typescript
const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
// 선택된 계수 값 (1.2, 1.375, 1.55, 1.725, 1.9)
```

**확인 버튼 클릭 시:**

- 선택된 계수를 백엔드 API로 전송 (API 엔드포인트 확인 필요)
- 성공 시 `router.push("/")`로 메인 화면 이동

### 2. 온보딩 인바디 페이지 수정

#### [MODIFY] `src/app/onboarding/inbody/page.tsx`

**변경 내용:**

- 업로드 성공 시: `router.push("/")` → `router.push("/onboarding/survey")` (line 47)
- 건너뛰기 시: `router.push("/")` → `router.push("/onboarding/survey")` (line 63)

---

## 파일 변경 요약

| 파일 | 작업 | 설명 |
|---|---|---|
| `src/app/onboarding/survey/page.tsx` | **[NEW]** | TDEE 활동계수 설문 페이지 |
| `src/app/onboarding/inbody/page.tsx` | **[MODIFY]** | 이동 경로를 `/` → `/onboarding/survey`로 변경 |

---

## 확인 필요 사항

1. **백엔드 API**: 활동 계수를 전송할 엔드포인트가 이미 있는지? 없다면 어떤 경로로 만들 건지?
   - 예: `POST /api/user/activity-level` → `{ activity_factor: 1.55 }`
2. **BottomNav 숨김**: 설문 페이지에서 BottomNav를 숨겨야 하는지?
   - 현재 `/login`, `/register`, `/find-id`, `/find-password`에서만 숨김 처리 중
   - 온보딩 경로(`/onboarding/*`)도 숨겨야 할 수 있음
