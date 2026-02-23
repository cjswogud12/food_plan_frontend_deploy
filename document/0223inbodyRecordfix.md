# Inbody 수동 입력 및 목표 재설정 구현 계획

## 문제 상황

Inbody 사진을 직접 촬영하여 OCR(`/inbody-ocr`) 업로드 시, **텍스트 추출이 불완전하여 일부 정보(체중, 신장, 골격근량, 체지방률, BMR 등)가 누락**되는 현상이 발생합니다.

현재 `MypageDetailModal.tsx`는 **읽기 전용**으로 데이터를 보여주기만 하며, 누락된 항목은 `-`로 표시됩니다.

## 목표

1. OCR 후 누락된 Inbody 정보를 **사용자가 직접 수정/입력**할 수 있게 한다.
2. 수정된 정보가 **백엔드에 저장**되고, **목표 칼로리가 자동 재계산**되어 식단 계획에 반영되도록 한다.

---

## 구현 범위

### 1단계: MypageDetailModal에 수동 입력 기능 추가

#### 수정 파일: `src/components/mypage/MypageDetailModal.tsx`

**현재 상태**: 읽기 전용 모달 (체중, 신장, 골격근량, 체지방률, BMI, BMR 표시)

**변경 내용**:

- "수정" 버튼을 헤더 또는 하단에 추가
- 수정 모드(`isEditing` state) 토글 시, 각 값이 `<input type="number">` 필드로 변경
- 편집 가능한 필드: **체중, 신장, 골격근량, 체지방률, BMR**
- BMI는 체중/신장으로 자동 계산되므로 **읽기 전용 유지** (입력하면 자동 갱신)
- "저장" 버튼 클릭 시 API 호출 → 성공 시 편집 모드 종료

**Props 변경**:

```tsx
interface MypageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    inbodyData: Partial<InbodyRecord> | null;
    onSave?: (updatedData: Partial<InbodyRecord>) => void;  // 추가
}
```

**UI 흐름**:

```
[체성분 상세 모달 열기]
  → 현재 데이터 표시 (누락 항목은 "-")
  → "수정" 버튼 클릭 → 입력 필드 전환
  → 값 입력/수정 → "저장" 클릭
  → API 호출 (updateInbodyManual)
  → 성공 → 부모 컴포넌트에 알림 (onSave 콜백)
  → 모달 닫기 or 읽기 모드 복귀
```

---

### 2단계: 수동 입력 API 함수 추가

#### 수정 파일: `src/api/index.ts`

**추가할 함수**:

```ts
// Inbody 수동 입력/수정
export async function updateInbodyManual(data: {
    weight?: number;
    height?: number;
    skeletal_muscle_mass?: number;
    body_fat_pct?: number;
    bmr?: number;
}) {
    return putJson("/inbody", data);
}
```

> [!IMPORTANT]
> **백엔드 확인 필요**: `PUT /api/inbody` 또는 `PATCH /api/inbody` 엔드포인트가 존재하는지 확인해야 합니다.
> 백엔드에 해당 엔드포인트가 없다면 백엔드 팀에 요청하거나, 기존 `/inbody-ocr` 엔드포인트를 활용하는 방안을 검토해야 합니다.

---

### 3단계: MypageInbody에서 수정 데이터 반영

#### 수정 파일: `src/components/mypage/MypageInbody.tsx`

**변경 내용**:

- `MypageDetailModal`에 `onSave` 콜백 전달
- `onSave` 호출 시 로컬 `inbodyData` state 업데이트
- `onInbodyUpdate` 콜백 호출하여 부모(`mypage/page.tsx`)에도 갱신 알림

```tsx
// MypageDetailModal에 onSave 전달
<MypageDetailModal
    isOpen={isDetailModalOpen}
    onClose={() => setIsDetailModalOpen(false)}
    inbodyData={inbodyData}
    onSave={(updatedData) => {
        setInbodyData(updatedData);
        if (onInbodyUpdate) onInbodyUpdate();
    }}
/>
```

---

### 4단계: 수정된 Inbody 데이터로 목표 칼로리 재설정

#### 관련 파일: `src/app/mypage/goal/activity/page.tsx`

**현재 로직 분석**:

- `getMypage()`로 `body.bmr` 가져옴
- BMR이 없으면 체중/신장으로 Mifflin-St Jeor 공식 추정
- `TDEE = BMR × 활동계수`
- 목표에 따라 `targetCalorie` 계산 (다이어트: TDEE×0.85, 증량: TDEE×1.15, 유지: TDEE)
- `updateUserGoal(userNumber, goalType, targetCalorie)` 호출

**변경 필요 여부**:

- 이 페이지 자체는 수정 불필요
- **Inbody 수동 입력 후** 사용자가 목표 설정 페이지(`/mypage/goal → /mypage/goal/activity`)를 다시 방문하면 자동으로 갱신된 BMR 기반 칼로리가 계산됨
- 단, **Inbody 수정 직후 자동으로 목표 칼로리를 재계산하려면** 아래 옵션 검토:

#### 옵션 A: 수동 입력 후 목표 설정 페이지로 이동 유도

- 저장 성공 후 "목표를 다시 설정하시겠습니까?" 확인 다이얼로그
- 확인 시 `/mypage/goal` 페이지로 라우팅

#### 옵션 B: 수동 입력 시 자동 목표 칼로리 재계산 (권장)

- `MypageDetailModal`의 저장 로직에서:
  1. `updateInbodyManual()` 호출로 Inbody 데이터 저장
  2. 저장 성공 후, 현재 활동 수준 + 목표 타입을 기반으로 `targetCalorie` 재계산
  3. `updateUserGoal()` 호출로 목표 칼로리 업데이트
  4. `resetDiet()` 호출로 식단 계획 리셋 (새 칼로리 기준으로 재생성 유도)

**옵션 B 상세 구현 (MypageDetailModal 내 저장 로직)**:

```ts
const handleSave = async () => {
    // 1. Inbody 데이터 저장
    const res = await updateInbodyManual(editedData);
    if (!res.ok) { alert("저장 실패"); return; }

    // 2. 목표 칼로리 재계산 (BMR 기반)
    const bmr = editedData.bmr || estimateBMR(editedData);
    const activityFactor = currentActivityFactor; // 기존 활동 수준
    const targetCalorie = calculateTargetCalorie(bmr, activityFactor, goalType);

    // 3. 목표 업데이트
    await updateUserGoal(userNumber, goalType, targetCalorie);

    // 4. 식단 리셋
    resetDiet();

    // 5. 부모에게 알림
    onSave?.(editedData);
};
```

---

## 수정 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `MypageDetailModal.tsx` | 수정 모드 추가 (input 필드, 저장 버튼), `onSave` 콜백 |
| `api/index.ts` | `updateInbodyManual()` 함수 추가 |
| `MypageInbody.tsx` | `onSave` 콜백 연결 |
| `goal/activity/page.tsx` | (옵션 B 선택 시) 변경 없음 — 재계산은 모달에서 처리 |

---

## 검증 계획

### 수동 테스트

1. **OCR 업로드 후 누락 확인**
   - Inbody 사진 업로드 → 일부 항목 `-`로 표시되는지 확인

2. **수동 입력 동작 확인**
   - 체성분 상세 모달 열기 → "수정" 버튼 클릭
   - 누락된 항목에 값 입력 → "저장" 클릭
   - 모달과 카드 양쪽에 수정된 값이 표시되는지 확인

3. **목표 칼로리 재계산 확인**
   - 수동 입력 저장 후 메인 페이지의 칼로리 바가 갱신되는지 확인
   - 또는 목표 설정 페이지 재방문 시 새 BMR 기반 칼로리가 계산되는지 확인

4. **엣지 케이스**
   - 값 없이 저장 시도 → 적절한 validation
   - 비정상 값(음수, 극단적 수치) 입력 시 처리

---

## 고려 사항

> [!WARNING]
> **백엔드 API 확인 필수**: `PUT /api/inbody` (수동 수정) 엔드포인트가 백엔드에 존재하는지 확인해야 합니다. 없다면 백엔드 개발이 선행되어야 합니다.

> [!NOTE]
> **옵션 A vs B 결정 필요**: Inbody 수정 후 목표 칼로리를 자동 재계산할지(옵션 B), 사용자가 직접 목표 설정 페이지를 다시 방문하게 할지(옵션 A) 결정이 필요합니다.
