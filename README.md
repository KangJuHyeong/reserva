# Reserva

이벤트 탐색부터 예약, 찜, 대시보드, 크리에이터 이벤트 관리까지 지원하는 풀스택 이벤트 예약 플랫폼입니다.  
포트폴리오 관점에서는 `예약 무결성`, `JWT/OAuth 인증`, `QueryDSL 기반 조회`, `배포 구조`, `성능 측정 및 최적화`를 함께 보여주기 위해 만든 프로젝트입니다.

## 프로젝트 소개

Reserva는 사용자가 이벤트를 탐색하고 예약할 수 있을 뿐 아니라, 크리에이터가 직접 이벤트를 생성·수정·삭제하며 자신의 이벤트 현황을 관리할 수 있도록 설계된 예약 마켓플레이스입니다.

이 프로젝트에서는 단순 CRUD 구현보다 아래 문제를 실제 제품 흐름 안에서 다루는 데 집중했습니다.
- 사용자와 크리에이터가 함께 쓰는 양면 서비스 구조
- JWT 기반 인증과 Google OAuth 연동
- 중복 예약 방지와 재고 정합성 유지
- 검색, 필터, 섹션, 페이지네이션이 결합된 조회 설계
- Vercel + EC2 + Nginx 기반의 경량 배포 구조

## 핵심 기능

### 사용자 기능
- 이벤트 탐색, 검색, 카테고리 필터, 섹션별 조회
- 이벤트 상세 조회와 바로 예약
- 찜 추가 / 제거
- 내 예약 목록 조회, 상세 조회, 예약 취소
- 대시보드에서 최근 활동과 요약 정보 확인

### 크리에이터 기능
- 이벤트 생성
- 내 이벤트 목록 조회
- 예약 오픈 전 이벤트 수정
- 예약 오픈 전 이벤트 삭제
- 예약 수량 현황 기반 이벤트 관리

### 인증
- 이메일 / 비밀번호 회원가입
- 이메일 / 비밀번호 로그인
- Google OAuth 로그인
- Spring Security 기반 JWT 보호 API

## 기술 스택

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Spring Boot, Spring Security, Spring Data JPA, QueryDSL, Flyway
- Database: MySQL
- Infra: Docker Compose, Nginx, EC2, Vercel, GitHub Actions, GHCR

## 아키텍처 / 배포

### 애플리케이션 구조
- `frontend`: Next.js 기반 웹 애플리케이션
- `backend`: Spring Boot API, 인증, 예약, 조회, 데이터 무결성 처리
- `docs`: 제품/엔지니어링/운영 문서
- `infra`: 배포 및 운영 관련 자산

### 배포 환경
- Frontend: Vercel
- Backend: EC2 위 Spring Boot
- Reverse Proxy: Nginx
- Database: MySQL
- Containerization: Docker Compose
- CI/CD: GitHub Actions -> GHCR -> EC2 redeploy

이 구조를 통해 프론트엔드는 Vercel의 배포 편의성을 활용하고, 백엔드와 DB는 EC2에서 독립적으로 관리할 수 있도록 구성했습니다.

## 기술적 도전과 해결

### 성능 최적화
README 작성 전에 먼저 성능 측정 환경을 만들고, 병목을 수치로 확인한 뒤 개선하는 흐름으로 작업했습니다.  
`k6`와 대량 시드 데이터를 이용해 `1000 / 5000 / 10000` 이벤트 규모에서 공개 이벤트 탐색 API를 반복 측정했고, 특히 `10000건` 구간에서 discovery 조회 성능이 급격히 악화되는 지점을 확인했습니다.

이후 공개 이벤트 탐색 쿼리를 중심으로 다음 개선을 적용했습니다.
- discovery `countQuery`에서 불필요한 `join` 제거
- 목록 조회를 `ID 페이지 조회 -> 필요한 행만 fetch join` 구조로 분리
- 검색 조건에서 비용이 큰 `description` 전체 검색을 제외하고 `title / location / creator` 중심으로 정리

그 결과 `10000건` 기준 공개 탐색 API의 p95는 다음처럼 개선되었습니다.
- 기본 목록: `540.80ms -> 233.59ms -> 217.58ms`
- 검색: `683.15ms -> 311.52ms -> 204.15ms`
- trending: `619.43ms -> 220.01ms -> 202.87ms`

또한 예약 생성은 `PESSIMISTIC_WRITE` 기반으로 동시성 테스트를 수행해 oversell 없이 정합성을 유지하는 것도 함께 검증했습니다.

상세 기록:
- [성능 테스트 가이드](./docs/operations/performance-testing.md)
- [성능 테스트 리포트](./docs/operations/performance-test-report-2026-03-29.md)

### 예약 동시성과 데이터 무결성
- 예약 생성 시 `event_inventory`에 비관적 락을 적용해 동시 요청에서도 초과 예약이 발생하지 않도록 처리했습니다.
- 중복 예약 방지 로직과 예약 취소 시 재고 복구를 같은 흐름 안에서 관리해 `reserved_slots <= total_slots` 조건이 유지되도록 설계했습니다.
- 예약 수량 제한도 이벤트별 `maxTicketsPerBooking`으로 제어해 단순 재고 감소 이상의 제품 규칙을 반영했습니다.

### 인증 경계 설계
- Spring Security의 stateless JWT 필터 체인으로 보호 API를 구성했습니다.
- 프론트엔드가 httpOnly 쿠키를 소유하고, 서버 런타임과 라우트 핸들러에서 백엔드로 Bearer 토큰을 전달하는 구조를 사용했습니다.
- 로컬 로그인과 Google OAuth를 같은 JWT 계약으로 수렴시켜 인증 흐름을 일관되게 유지했습니다.

### QueryDSL 기반 조회 설계
- 공개 이벤트 탐색과 크리에이터 이벤트 목록처럼 검색, 필터, 섹션, 정렬, 페이지네이션이 함께 붙는 조회는 QueryDSL로 구성했습니다.
- 단순 repository 메서드보다 동적 조건 조합과 섹션별 분기를 더 명확하게 표현할 수 있도록 설계했습니다.

## 실행 방법

### Backend
```powershell
cd backend
.\run-local.ps1
```

로컬 설정은 `backend/.env`를 기준으로 합니다.

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

프론트엔드 런타임 설정은 `frontend/.env.example`의 `BACKEND_BASE_URL`을 참고하면 됩니다.

## 문서

- [구현 현황](./docs/product/implementation-status.md)
- [아키텍처](./docs/engineering/architecture.md)
- [API 명세](./docs/engineering/api-spec.md)
- [DB 모델](./docs/engineering/db.md)
- [운영 문서 인덱스](./docs/operations/README.md)

## 작업 원칙

개발과 구현 범위의 기준 문서는 `agent.md`입니다.  
세부 제품/엔지니어링/운영 판단은 `docs` 문서와 현재 코드를 기준으로 맞춰갑니다.
