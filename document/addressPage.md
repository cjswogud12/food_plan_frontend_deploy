# 주소 정보(집/회사) 입력 페이지 구현 계획

## 목표

`survey`(활동량 설문) 페이지 이후, 사용자의 **집 주소**와 **회사 주소**를 입력받는 페이지를 구현한다.
입력받은 주소는 위도(lat), 경도(lng) 좌표로 변환되어 백엔드로 전송된다.

---

## 사용자 흐름

1. `/onboarding/survey`: 활동량 선택 후 [확인] 클릭
2. **`/onboarding/address` (신규)**: 집 주소 및 회사 주소 입력 (건너뛰기 가능 혹은 필수)
3. 주소 입력 완료 후 [시작하기] 클릭
4. 메인 화면(`/`)으로 이동

---

## 구현 사항

### 1. 페이지 생성: `src/app/onboarding/address/page.tsx`

**UI 구성:**

- **헤더**: "주소 설정"
- **입력 폼 1: 집 주소 (Home)**
  - [우편번호 검색] 버튼 (Daum Postcode API 활용 제안)
  - 선택된 기본 주소 (readOnly)
  - 상세 주소 입력 (text)
- **입력 폼 2: 회사 주소 (Company)**
  - [우편번호 검색] 버튼
  - 선택된 기본 주소 (readOnly)
  - 상세 주소 입력 (text)
- **하단 버튼**: [확인] (메인으로 이동)

**기능 요구사항:**

1. **주소 검색**: 사용자가 쉽게 주소를 입력할 수 있도록 주소 검색 기능 필요.
   - `react-daum-postcode` 패키지 사용 권장 (가장 간편하고 정확함).
2. **좌표 변환 (Geocoding)**:
   - "백엔드로 lat, lng를 넘겨줘야 함" 요구사항 충족을 위해, 주소 선택 시 **좌표 변환** 과정이 필요.
   - Kakao Maps API 또는 Naver Maps API의 Geocoding 기능 사용 필요.
   - *임시 방편*: 좌표 변환 API 키가 프론트에 없다면, 우선 주소 텍스트만 받고 백엔드에서 처리하도록 협의하거나, 테스트용 임시 좌표(서울 시청 등)를 넣을 수 있음. (계획 승인 시 확인 필요)

### 2. 데이터 전송 구조

**API 엔드포인트 (백엔드)**: `POST /api/user/locations` (예시)

**전송 데이터 포맷 (List 형태 제안)**:
사용자가 집과 회사를 모두 입력했을 경우, 배열로 묶어서 전송하거나 2번 호출해야 합니다.

```json
// 요청 예시
{
  "locations": [
    {
      "label": "home",
      "address_text": "충청남도 천안시 ...",
      "lat": 36.815,
      "lng": 127.113,
      "radius_m": 500
    },
    {
      "label": "company",
      "address_text": "서울 중구 세종대로 ...",
      "lat": 37.566,
      "lng": 126.977,
      "radius_m": 500
    }
  ]
}
```

### 3. 기존 파일 수정

**`src/app/onboarding/survey/page.tsx`**:

- [확인] 버튼 클릭 시 이동 경로 변경:
  - 기존: `router.push("/")`
  - 변경: `router.push("/onboarding/address")`

**`src/components/BottomNav.tsx`**:

- `/onboarding/address` 경로에서도 하단 네비게이션 숨김 처리 (이미 `startsWith("/onboarding")`으로 처리되어 있다면 수정 불필요)

---

## 기술적 고려사항 (확인 필요)

1. **주소 → 좌표 변환 (Geocoding) 주체**:
   - 프론트엔드에서 하려면 **Kakao JavaScript Key** 또는 **Naver Client ID**가 필요합니다.
   - 키가 없다면: 주소 텍스트만 백엔드로 보내고 백엔드에서 좌표를 따는 것이 보안상/구조상 더 나을 수 있습니다.
   - *사용자 요청*: "백엔드로 lat, lng를 넘겨줘야 해" → 프론트에서 좌표를 알아내야 함. **Kakao Maps SDK** 사용을 제안합니다.

2. **반경(`radius_m`) 설정**:
   - 기본값 500m로 고정할지, 사용자에게 선택권을 줄지 (UI 복잡도 증가).
   - 초기엔 고정값(500m) 사용 권장.

---

## 작업 순서

1. `addressPage.md` 계획 확정
2. `survey` 페이지 라우팅 수정
3. `address` 페이지 퍼블리싱 (우선 좌표 변환 없이 UI만 구현)
4. 주소 검색/좌표 변환 로직 연동
