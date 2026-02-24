# FloatingCameraButton 인바디 기능 삭제

## 날짜

2024-02-23

## 대상 파일

- `src/components/FloatingCameraButton.tsx`

## 변경 목적

- FAB(플로팅 액션 버튼)에서 **인바디 기록 기능을 완전히 제거**하고, **음식 기록 기능만** 유지

## 변경 내역

### 1. import 정리

- `uploadInbodyImage` import 삭제
- `uploadFoodImage`만 유지

```diff
-import { uploadInbodyImage, uploadFoodImage } from "@/api/index";
+import { uploadFoodImage } from "@/api/index";
```

### 2. State 삭제

- `cameraMode` state 삭제 (인바디/음식 모드 구분이 필요 없어짐)

```diff
-const [cameraMode, setCameraMode] = useState<'inbody' | 'food'>('food');
```

### 3. handleSubmit 함수 단순화

- `cameraMode` 분기 로직 제거
- `uploadInbodyImage` 호출 제거
- `uploadFoodImage`만 직접 호출하도록 변경
- alert 메시지도 삼항 연산자 제거 → `"음식 이미지가 업로드되었습니다!"` 고정

```diff
-const response = cameraMode === 'inbody'
-    ? await uploadInbodyImage(formData)
-    : await uploadFoodImage(formData);
+const response = await uploadFoodImage(formData);

-alert(cameraMode === 'inbody' ? "인바디 이미지가 업로드되었습니다!" : "음식 이미지가 업로드되었습니다!");
+alert("음식 이미지가 업로드되었습니다!");
```

### 4. UI - 인바디 모드 선택 버튼 삭제

- 카메라 모달 헤더에 있던 **인바디 기록 탭 버튼** 전체 삭제
- `setCameraMode('inbody')` 관련 코드 제거

### 5. UI - 음식 기록 버튼 스타일 정리

- `cameraMode === 'food'` 조건부 스타일 제거 → 항상 활성 스타일 적용
- `setCameraMode('food')` 호출 제거

```diff
-className={`rounded-full ${cameraMode === 'food'
-    ? 'bg-white text-black hover:bg-white/90'
-    : 'bg-white/20 text-white/70 hover:bg-white/30'}`}
+className={`rounded-full bg-white text-black hover:bg-white/90`}
```

### 6. 서브메뉴 조건 단순화

- `cameraMode === 'food'` 조건 제거, `showMealOptions`만 체크

```diff
-{showMealOptions && cameraMode === 'food' && (
+{showMealOptions && (
```

## 현재 동작

- FAB(`+`) 클릭 → 카메라 버튼 → 카메라 모달 열림
- 카메라 모달에서 **음식 기록 버튼** 클릭 → 아침/점심/저녁 선택
- 촬영 후 `uploadFoodImage` API로 업로드
