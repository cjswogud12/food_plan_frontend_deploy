# Onboarding 설문 페이지 - 백엔드 엔드포인트 연결 개발 계획

> 작성일: 2026-02-19

## 📌 목표

온보딩 survey(활동 수준), address(주소) 페이지에서 실제 백엔드 API를 호출하도록 연결.

---

## 🔍 현재 상태

### 1. `survey/page.tsx` (활동 수준)

**현재**: `console.log`만 찍고 다음 페이지로 이동

```typescript
// TODO: 백엔드 엔드포인트 연결
// await postJson("/api/user/activity-level", { activity_factor: selectedFactor });
console.log("선택된 활동 계수:", selectedFactor);
```

**백엔드 엔드포인트**: `POST /api/user/activity-level`

- Request: `{ "user_number": number, "activity_level": "string" }`
- Response: `{ "user_number": int, "activity_level": "string", "factor": float }`

**API 함수**: `updateUserActivity` — `src/api/index.ts` (line 314)에 **이미 존재!**

```typescript
export async function updateUserActivity(userNumber: number, activityLevel: string) {
    return postJson("/user/activity-level", {
        user_number: userNumber,
        activity_level: activityLevel
    });
}
```

**필요한 것:**

- `user_number`: `localStorage.getItem("user_number")` 에서 가져옴
- `activity_level`: 선택한 항목의 `label` (예: "거의 운동 안 함", "가벼운 활동" 등)
- 현재는 `factor` (숫자)만 사용하고 있으므로 `label` (문자열)을 보내도록 변경 필요

---

### 2. `address/page.tsx` (주소)

**현재**: `localStorage`에만 저장

```typescript
// TODO: 백엔드 엔드포인트 연결
// await postJson("/user/locations", { locations });
console.log("전송할 주소 데이터:", locations);
```

**백엔드 엔드포인트**: `POST /api/recommend/menu-save`

- 기존 `fetchMenuSave` 함수 사용 — `src/api/index.ts` (line 286)에 **이미 존재!**
- Request: `{ label, address_text, radius_m }`

**추가로** 주소 저장용 API도 사용 가능:

- `updateUserAddress` — `src/api/index.ts` (line 309)
- Request: `{ user_number, home_address, company_address }`

---

## 🛠️ 수정 계획

### 1. `src/app/onboarding/survey/page.tsx`

```diff
+ import { updateUserActivity } from "@/api/index";

  const handleConfirm = async () => {
      if (selectedIndex === null) return;
      setIsSubmitting(true);
      try {
-         const selectedFactor = ACTIVITY_LEVELS[selectedIndex].factor;
-         // TODO: 백엔드 엔드포인트 연결
-         // await postJson("/api/user/activity-level", { activity_factor: selectedFactor });
-         console.log("선택된 활동 계수:", selectedFactor);
+         const selectedLevel = ACTIVITY_LEVELS[selectedIndex];
+         const userNumber = Number(localStorage.getItem("user_number"));
+
+         const res = await updateUserActivity(userNumber, selectedLevel.label);
+         if (!res.ok) throw new Error("활동 수준 저장 실패");
+
+         const data = await res.json();
+         console.log("활동 수준 저장 완료:", data);

          router.push("/onboarding/address");
```

---

### 2. `src/app/onboarding/address/page.tsx`

```diff
+ import { fetchMenuSave } from "@/api/index";

  const handleConfirm = async () => {
      if (!isValid) return;
      setIsSubmitting(true);
      try {
          const locations = [
              { label: "home", address_text: homeAddress.trim(), radius_m: 500 },
              { label: "company", address_text: companyAddress.trim(), radius_m: 500 },
          ];

          localStorage.setItem("user_locations", JSON.stringify(locations));

-         // TODO: 백엔드 엔드포인트 연결
-         // await postJson("/user/locations", { locations });
-         console.log("전송할 주소 데이터:", locations);
+         // 각 주소별로 fetchMenuSave 호출
+         for (const loc of locations) {
+             const res = await fetchMenuSave(loc.label, loc.address_text, undefined, undefined, loc.radius_m);
+             if (!res.ok) {
+                 console.error(`${loc.label} 주소 저장 실패:`, await res.text());
+             }
+         }
+         console.log("주소 데이터 전송 완료");

          router.push("/");
```

---

## 📋 수정 파일 요약

| 파일 | 변경 내용 |
|---|---|
| `src/app/onboarding/survey/page.tsx` | `updateUserActivity` import + 호출 (label, user_number 전달) |
| `src/app/onboarding/address/page.tsx` | `fetchMenuSave` import + 각 주소별 호출 |

> `src/api/index.ts`는 수정 불필요 (함수 이미 존재)

---

## ✅ 검증 방법

1. 온보딩 **활동 수준 선택** → 확인 버튼 → 브라우저 개발자 도구 Network 탭에서 `/api/user/activity-level` 요청/응답 확인
2. 온보딩 **주소 입력** → 시작하기 버튼 → Network 탭에서 `/api/recommend/menu-save` 요청 2회 (home, company) 확인
3. 에러 발생 시 alert 표시 확인
