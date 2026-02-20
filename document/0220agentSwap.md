# 에이전트 페이지 → 메인 페이지 교체 계획

## 목표

현재 `/agent` 경로의 `agent/page.tsx`를 메인 페이지(`/`)로 변경하고, 기존 `page.tsx`(AI 식단 계획 기반 리스트 UI)는 삭제한다.
마이페이지의 '내 장소 설정' UI도 함께 삭제한다.

---

## 변경 사항 요약

### 1. `src/app/agent/page.tsx` → `src/app/page.tsx` 교체

| 항목 | 내용 |
|------|------|
| 작업 | 기존 `src/app/page.tsx` 삭제 후, `src/app/agent/page.tsx` 내용을 `src/app/page.tsx`로 이동 |
| import 변경 | 없음 (모든 import가 `@/` 절대경로 사용 중이라 경로 변경 불필요) |
| 폴더 정리 | `src/app/agent/` 폴더 자체 삭제 |

#### import 분석

```
import { useViewport } from "@/context/ViewportContext"         ← 변경 불필요 ✅
import FloatingCameraButton from "@/components/FloatingCameraButton"  ← 변경 불필요 ✅
import { Button } from "@/components/ui/button"                  ← 변경 불필요 ✅
import { getUser, getUserGoal, ... } from "@/api/index"          ← 변경 불필요 ✅
import { useUserStore, useDietStore } from "@/store"             ← 변경 불필요 ✅
import { DietPlanKakaoMap, ... } from "@/types/definitions"      ← 변경 불필요 ✅
import AgentFoodItem from "@/components/agent/Mainagent"         ← ⚠️ 경로 변경 필요
```

**변경 필요:**

```diff
- import AgentFoodItem from "@/components/agent/Mainagent"
+ import AgentFoodItem from "@/components/main/Mainagent"
```

---

### 2. `src/components/agent/` → `src/components/main/` 이동

| 항목 | 내용 |
|------|------|
| 작업 | `src/components/agent/Mainagent.tsx`를 `src/components/main/Mainagent.tsx`로 이동 |
| 폴더 정리 | 이동 후 `src/components/agent/` 폴더 삭제 |

> [!NOTE]
> `src/components/main/` 폴더에는 이미 `MainFood.tsx`, `Mainfoodeatinfo.tsx`가 존재.
> `Mainagent.tsx`를 같은 폴더에 합류시킴.

---

### 3. `src/components/BottomNav.tsx` 수정

**현재 상태:**

```tsx
const navItems = [
    { href: "/", label: "홈", icon: House },
    { href: "/agent", label: "home2", icon: House },  // ← 이거 삭제
    { href: "/record", label: "기록", icon: List },
    { href: "/mypage", label: "마이페이지", icon: User }
];
```

**변경 후:**

```tsx
const navItems = [
    { href: "/", label: "홈", icon: House },
    { href: "/record", label: "기록", icon: List },
    { href: "/mypage", label: "마이페이지", icon: User }
];
```

- `/agent` 항목 삭제 (메인 페이지가 되었으니 `/`와 중복)

---

### 4. `src/components/mypage/MypageProfileTarget.tsx` — '내 장소 설정' UI 삭제

**삭제할 코드 영역:**

#### (A) 주소 관련 State 및 핸들러 (22~59줄)

```tsx
// 삭제 대상
import { Home, Building2, Save } from "lucide-react";  // Home, Building2, Save 제거

// Address State
const [homeAddress, setHomeAddress] = useState("");
const [workAddress, setWorkAddress] = useState("");
const [isAddressChanged, setIsAddressChanged] = useState(false);

// Initial Address Load (useEffect 전체)
// handleSaveAddress 함수 전체
```

#### (B) UI 렌더링 부분 (201~254줄)

```tsx
// 삭제 대상: Divider + Address Inputs 섹션 전체
{/* Divider */}
<div className="h-px bg-slate-100 w-full" />

{/* Bottom: Address Inputs */}
<div className="space-y-4">
    <h3>내 장소 설정</h3>
    ... (집/회사 주소 입력 + 저장 버튼 전체)
</div>
```

---

## 파일별 작업 순서

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `src/app/page.tsx` | 기존 파일 삭제 |
| 2 | `src/app/agent/page.tsx` | 내용을 `src/app/page.tsx`로 복사(이동) |
| 3 | `src/app/agent/` | 폴더 삭제 |
| 4 | `src/components/agent/Mainagent.tsx` | `src/components/main/Mainagent.tsx`로 이동 |
| 5 | `src/components/agent/` | 폴더 삭제 |
| 6 | `src/app/page.tsx` (새로 생성된) | import 경로 `@/components/agent/Mainagent` → `@/components/main/Mainagent` 변경 |
| 7 | `src/components/BottomNav.tsx` | `/agent` 네비 항목 삭제 |
| 8 | `src/components/mypage/MypageProfileTarget.tsx` | '내 장소 설정' UI + 관련 state/핸들러 삭제, 불필요 import 정리 |

---

## 참고: 영향 없는 파일

- `src/components/main/MainFood.tsx` — 변경 없음
- `src/components/main/Mainfoodeatinfo.tsx` — 변경 없음
- `src/store/index.ts` — 변경 없음
- `src/api/index.ts` — 변경 없음
- `src/app/mypage/page.tsx` — 변경 없음 (MypageProfileTarget 컴포넌트 사용은 그대로)
- `src/app/mypage/address/` — 별도 주소 설정 페이지는 유지 (MypageMenu에서 라우팅)

---

## 검증 방법

1. `npm run dev` (또는 `npx next dev -p 3005`) 실행 후:
   - `/` 경로 접속 → 에이전트 페이지(3D 캐러셀 식단 UI)가 표시되는지 확인
   - `/agent` 경로 → 404 뜨는지 확인
   - 하단 네비게이션 바에 `/agent` 항목이 없는지 확인
   - 마이페이지 → 프로필 섹션에 '내 장소 설정' UI가 없는지 확인
   - 마이페이지 → '주소 설정' 버튼(MypageMenu)은 정상 작동하는지 확인
