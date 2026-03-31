# Reserva DB 요약

## 개요

Reserva의 데이터 모델은 사용자, 이벤트, 재고, 예약, 찜을 중심으로 구성됩니다. 핵심 관심사는 이벤트 정보 자체보다도, 예약 가능 수량과 예약 상태를 어떻게 안전하게 유지할 것인가에 있습니다.

현재 스키마는 Flyway 마이그레이션을 기준으로 관리되며, 주요 테이블은 `users`, `events`, `event_inventory`, `bookings`, `watchlists`입니다.

## 핵심 테이블

### `users`
사용자 정보를 저장합니다.
- 이메일/비밀번호 로그인 지원
- Google OAuth 계정 연동 지원
- 주최자와 일반 사용자를 같은 사용자 모델로 관리

주요 컬럼:
- `id`
- `email`
- `password_hash`
- `google_subject`
- `display_name`
- `profile_image_url`
- `created_at`
- `updated_at`

제약:
- `email` unique
- `google_subject`는 값이 있을 때 unique

### `events`
이벤트와 모임의 기본 정보를 저장합니다.

주요 컬럼:
- `id`
- `creator_id`
- `title`
- `category`
- `description`
- `image_url`
- `location`
- `price`
- `event_datetime`
- `reservation_open_datetime`
- `max_tickets_per_booking`
- `status`
- `visibility`
- `created_at`
- `updated_at`

역할:
- 홈 화면, 상세 화면, 내가 만든 이벤트 화면에서 사용하는 기본 데이터
- 주최자와 이벤트를 연결하는 기준 테이블

### `event_inventory`
이벤트의 예약 가능 수량 상태를 별도로 저장합니다.

주요 컬럼:
- `event_id`
- `total_slots`
- `reserved_slots`
- `updated_at`

이 테이블을 분리한 이유:
- 이벤트 본문 정보와 재고 상태를 역할별로 나누기 위함
- 예약 생성/취소 시 정합성 있는 상태 관리를 더 명확하게 하기 위함

핵심 제약:
- `total_slots >= 1`
- `reserved_slots >= 0`
- `reserved_slots <= total_slots`

### `bookings`
사용자의 예약 내역을 저장합니다.

주요 컬럼:
- `id`
- `booking_code`
- `user_id`
- `event_id`
- `status`
- `participant_name`
- `ticket_count`
- `unit_price`
- `total_amount`
- `booked_at`
- `cancelled_at`
- `created_at`
- `updated_at`

역할:
- 예약 이력 저장
- 예약 상세 화면과 내 예약 목록 데이터 제공
- 취소 시 상태 변경과 재고 복구 기준 제공

### `watchlists`
사용자가 저장한 찜 이벤트를 관리합니다.

주요 컬럼:
- `id`
- `user_id`
- `event_id`
- `created_at`

핵심 제약:
- `(user_id, event_id)` unique

## 관계 요약
- `users 1:N events`
- `events 1:1 event_inventory`
- `users 1:N bookings`
- `events 1:N bookings`
- `users N:M events` through `watchlists`

## 정합성 관점에서 중요한 점

### 1. 이벤트 정보와 재고 상태를 분리
예약 서비스에서 실제로 경쟁이 발생하는 것은 이벤트 설명이 아니라 남은 수량입니다. 그래서 `events`와 `event_inventory`를 분리해, 예약 처리 시 재고 상태에 집중할 수 있도록 구성했습니다.

### 2. 예약 생성과 재고 반영을 같은 흐름에서 처리
예약이 성공했는데 재고 반영이 실패하거나, 반대로 재고만 줄고 예약이 저장되지 않으면 문제가 됩니다. 이를 막기 위해 예약 생성과 재고 변경이 같은 트랜잭션 흐름 안에서 처리되도록 설계했습니다.

### 3. 예약 취소 시 재고 복구도 함께 처리
취소는 단순 상태 변경이 아니라 수량 복구까지 포함된 동작입니다. 그래서 `cancelled` 상태 전환과 `reserved_slots` 감소를 함께 반영하는 구조가 필요합니다.

## 조회 관점에서 중요한 점
- 주최자별 이벤트 목록 조회
- 사용자별 예약 목록 조회
- 카테고리 기반 이벤트 조회
- 공개 이벤트 탐색용 조건 조합
- 찜 여부 및 찜 목록 조회

이런 요구 때문에 단순 CRUD용 테이블 설계보다, 조회와 정합성을 함께 고려한 구조가 필요했습니다.

## 관련 문서
- [README](../../README.md)
- [API 요약 문서](./api-spec.md)
