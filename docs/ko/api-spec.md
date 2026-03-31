# Reserva API 요약

## 개요

Reserva의 API는 `/api/v1` 기준으로 동작합니다. 현재 구현 범위는 인증, 이벤트 탐색, 예약, 찜, 대시보드, 주최자 이벤트 관리까지 포함합니다.

인증은 JWT bearer 기반이며, 프론트엔드가 httpOnly 쿠키를 관리하고 백엔드 호출 시 토큰을 전달하는 구조를 사용합니다.

## 인증 API

### `POST /api/v1/auth/signup`
- 이메일/비밀번호 회원가입
- 회원 생성 후 JWT 발급

### `POST /api/v1/auth/login`
- 이메일/비밀번호 로그인
- 로그인 성공 시 JWT 발급

### `POST /api/v1/auth/oauth/google/exchange`
- Google OAuth 인가 코드를 받아 애플리케이션 JWT로 교환

### `GET /api/v1/me`
- 현재 로그인한 사용자 정보 조회

### `POST /api/v1/auth/logout`
- 로그아웃 처리
- 현재 구조에서는 stateless logout 기준으로 동작

## 이벤트 조회 API

### `GET /api/v1/events`
- 공개 이벤트 목록 조회
- 지원 기능:
  - 검색어 `q`
  - 카테고리 `category`
  - 섹션 `section`
  - 페이지네이션 `page`, `size`
- 핵심 특징:
  - 홈 화면 기본 목록 조회
  - `trending`, `endingSoon`, `openingSoon`, `watchlist` 섹션 지원
  - QueryDSL 기반 동적 조회

### `GET /api/v1/events/{eventId}`
- 이벤트 상세 조회
- 이벤트 정보, 재고 상태, 주최자 정보, 찜 상태 반환

## 예약 API

### `POST /api/v1/events/{eventId}/bookings`
- 특정 이벤트 예약 생성
- 검증 항목:
  - 인증 여부
  - 이벤트 존재 여부
  - 예약 가능 수량
  - 중복 예약 여부
  - 이벤트별 최대 예약 수량 제한
- 현재 구현 포인트:
  - 재고 상태를 기준으로 예약 정합성을 관리
  - 동시 요청 상황에서도 oversell 방지를 목표로 설계

### `GET /api/v1/me/bookings`
- 내 예약 목록 조회
- 상태 필터와 페이지네이션 지원

### `GET /api/v1/me/bookings/{bookingId}`
- 내 예약 상세 조회

### `POST /api/v1/me/bookings/{bookingId}/cancel`
- 예약 취소
- 취소 시 예약 상태 변경과 재고 복구가 함께 처리됨

## 찜 API

### `POST /api/v1/events/{eventId}/watchlist`
- 이벤트 찜 추가

### `DELETE /api/v1/events/{eventId}/watchlist`
- 이벤트 찜 해제

## 대시보드 및 주최자 API

### `GET /api/v1/me/dashboard-summary`
- 대시보드 요약 정보 조회
- 최근 예약, 찜, 오픈 예정 이벤트, 내가 만든 이벤트 요약 포함

### `GET /api/v1/me/events`
- 내가 만든 이벤트 목록 조회
- 필터, 정렬, 페이지네이션 지원

### `GET /api/v1/me/events/{eventId}`
- 내가 만든 이벤트 상세 조회

### `POST /api/v1/events`
- 이벤트 생성

### `PATCH /api/v1/events/{eventId}`
- 이벤트 수정
- 예약 오픈 전까지만 허용

### `DELETE /api/v1/events/{eventId}`
- 이벤트 삭제
- 예약이 없고 예약 오픈 전인 경우에만 허용

## 대표 에러 코드
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `EVENT_NOT_FOUND`
- `BOOKING_NOT_FOUND`
- `EVENT_SOLD_OUT`
- `ALREADY_BOOKED`
- `BOOKING_QUANTITY_LIMIT_EXCEEDED`
- `INVALID_SCHEDULE`
- `BOOKING_NOT_CANCELLABLE`
- `EVENT_NOT_DELETABLE`

## API 설계 포인트
- 인증이 필요한 요청은 JWT bearer 토큰 기준으로 보호됩니다.
- 공개 이벤트 조회 API는 기능 수가 많아 QueryDSL로 동적 조합을 처리합니다.
- 예약 API는 기능 동작보다 정합성 보장을 우선해 설계했습니다.
- 주최자 이벤트 수정/삭제는 예약 오픈 시점을 기준으로 제약을 둡니다.

## 관련 문서
- [README](../../README.md)
- [DB 요약 문서](./db.md)
