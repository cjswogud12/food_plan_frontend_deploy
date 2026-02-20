# 2026-02-20 업데이트 로그

## 1. Agent 페이지 → 메인 페이지 교체

기존 `/agent` 페이지(3D 회전 캐러셀 식당 추천)를 메인 페이지(`/`)로 교체.
기존 메인 페이지(AI 식단 계획 리스트)는 제거됨.

### 변경 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/app/page.tsx` | **덮어쓰기** | 기존 내용 삭제 후 `agent/page.tsx` 내용으로 교체. import 경로를 `@/components/main/Mainagent`로 변경 |
| `src/app/agent/page.tsx` | **삭제** | 메인 페이지로 이동했으므로 삭제 |
| `src/app/agent/` | **폴더 삭제** | agent 라우트 제거 |
| `src/components/agent/Mainagent.tsx` | **이동** | `src/components/main/Mainagent.tsx`로 이동 |
| `src/components/agent/` | **폴더 삭제** | 빈 폴더 제거 |
| `src/components/BottomNav.tsx` | **수정** | `navItems`에서 `/agent` 항목 삭제 (홈, 기록, 마이페이지 3개만 유지) |

---

## 2. 마이페이지 '내 장소 설정' UI 제거

`MypageProfileTarget.tsx`에서 집/회사 주소 입력 UI 및 관련 로직 삭제.
주소 설정은 별도 주소 설정 페이지(`/mypage/address`)에서 관리.

### 변경 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/mypage/MypageProfileTarget.tsx` | **수정** | `Home`, `Building2`, `Save` 아이콘 import 제거. 주소 관련 state(`homeAddress`, `workAddress`, `isAddressChanged`), `useEffect`(주소 로드), `handleSaveAddress` 핸들러, 주소 입력 UI(내 장소 설정 섹션 전체) 삭제 |

---

## 3. 식단 체크 → 백엔드 DB 저장 기능 추가

메인 페이지에서 식단 메뉴를 체크(먹었다고 표시)하면 기존에는 로컬(Zustand + localStorage)에만 저장되었음.
이제 백엔드 DB에도 저장하여, 기록 페이지 캘린더에서 조회 가능.

**엔드포인트**: `POST /api/recommend/menu-save`

### 변경 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/types/definitions.ts` | **수정** | `MenuCheckItem`, `MenuCheckRequest`, `MenuCheckResponse` 타입 추가 |
| `src/api/index.ts` | **수정** | `saveMenuCheck()` 함수 추가 (같은 엔드포인트 사용, meals 배열 포함) |
| `src/app/page.tsx` | **수정** | `handleCheckItem`에서 `saveMenuCheck` API 비동기 호출 추가. 로컬 상태는 즉시 반영, 백엔드 저장은 비동기 처리 |
| `src/app/record/page.tsx` | **수정** | `checkedMeals` 합산 로직 제거(방안 A). API 데이터만 사용하여 중복 방지. `useDietStore` import 제거 |

---

## 4. TodayIntake 낙관적 업데이트

체크/해제 시 `todayIntake` 영양 정보를 즉시 UI에 반영하도록 Store 수정.

### 변경 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/store/index.ts` | **수정** | `toggleMealCheck` 내부에서 체크 시 칼로리/탄수화물/단백질/지방을 더하고, 해제 시 빼는 낙관적 업데이트 로직 추가. 폴백 객체에 `TodayIntake` 필수 필드(`goal_type`, `target_calorie`, `plan_date`) 추가 |

---

## 5. Mainagent 컴포넌트 재생성

### 변경 파일

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/main/Mainagent.tsx` | **신규 생성** | 식당 메뉴 아이템 컴포넌트. 체크박스, 메뉴명(카카오맵 링크), 식당명, 거리, 칼로리, 가격 표시. `place_url`이 있으면 클릭 시 새 탭에서 열림 |

---

## 전체 변경 파일 목록

| 상태 | 파일 경로 |
|------|-----------|
| 덮어쓰기 | `src/app/page.tsx` |
| 삭제 | `src/app/agent/page.tsx` |
| 삭제 | `src/app/agent/` (폴더) |
| 삭제 | `src/components/agent/` (폴더) |
| 신규 | `src/components/main/Mainagent.tsx` |
| 수정 | `src/components/BottomNav.tsx` |
| 수정 | `src/components/mypage/MypageProfileTarget.tsx` |
| 수정 | `src/types/definitions.ts` |
| 수정 | `src/api/index.ts` |
| 수정 | `src/store/index.ts` |
| 수정 | `src/app/record/page.tsx` |
| 신규 | `document/0220agentSwap.md` (계획 문서) |
| 신규 | `document/0220checkboxRecord.md` (계획 문서) |
