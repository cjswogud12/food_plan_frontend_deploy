##Food Plan Frontend - 의존성 목록}

> 생성일: 2026-01-23  
> Node.js 프로젝트 (package.json 기반)

---

## 🔧 Core Framework

| 패키지 | 버전 | 설명 |
|--------|------|------|
| `next` | 16.1.4 | Next.js 프레임워크 |
| `react` | 19.2.3 | React 라이브러리 |
| `react-dom` | 19.2.3 | React DOM 렌더러 |
| `typescript` | ^5 | TypeScript |

---

## 📦 Runtime Dependencies (런타임 의존성)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@tanstack/react-query` | ^5.90.19 | 서버 상태 관리 & API 캐싱 |
| `zustand` | ^5.0.10 | 전역 상태 관리 |
| `react-hook-form` | ^7.71.1 | 폼 관리 |
| `zod` | ^4.3.6 | 스키마 검증 |
| `recharts` | ^3.7.0 | 차트 라이브러리 |
| `lucide-react` | ^0.562.0 | 아이콘 |
| `openapi-fetch` | ^0.15.0 | OpenAPI 기반 API 클라이언트 |

---

## 🛠️ Dev Dependencies (개발 의존성)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `openapi-typescript` | ^7.10.1 | OpenAPI → TypeScript 타입 생성 |
| `tailwindcss` | ^4 | CSS 프레임워크 |
| `@tailwindcss/postcss` | ^4 | Tailwind PostCSS 플러그인 |
| `eslint` | ^9 | 코드 린터 |
| `eslint-config-next` | 16.1.4 | Next.js ESLint 설정 |
| `@types/node` | ^20 | Node.js 타입 |
| `@types/react` | ^19 | React 타입 |
| `@types/react-dom` | ^19 | React DOM 타입 |

---

## ⚙️ Overrides (의존성 오버라이드)

| 패키지 | 버전 | 이유 |
|--------|------|------|
| `react-is` | 19.2.3 | recharts React 19 호환성 |

---

## 🔗 Backend 호환성

이 프론트엔드는 다음 백엔드 스택과 연동됩니다:

| 패키지 | 버전 |
|--------|------|
| Python | 3.10 |
| FastAPI | 0.109.0 |
| uvicorn | 0.27.0 |
| SQLAlchemy | 2.0.25 |
| psycopg2-binary | 2.9.9 |
| pydantic | 2.5.3 |
| python-multipart | 0.0.6 |

---

## 📋 설치 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```
