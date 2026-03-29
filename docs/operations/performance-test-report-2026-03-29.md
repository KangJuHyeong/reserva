# 성능 테스트 리포트
Date: 2026-03-29

## 범위
- 백엔드 API 기준 로컬 k6 부하 테스트
- `PerformanceDataSeeder` 기반 대량 시드 검증
- 공개 이벤트 탐색 조회, 크리에이터 워크스페이스, 예약 워크스페이스, 예약 동시성 측정
- 공개 이벤트 탐색 조회 병목 분석과 단계별 쿼리 최적화

## 측정 기준 코드 상태
- 기준 브랜치: `origin/main`
- 기준 커밋: `43a5220`
- 기준 커밋 설명: `Merge pull request #27 from KangJuHyeong/feat/event-delete-and-booking-cancel`
- 대상 API: `GET /api/v1/events`
- 병목 확인 범위: 홈 화면 공개 이벤트 목록 및 검색 조회
- 문서 목적: 이후 코드가 더 바뀌더라도 이 리포트의 전후 비교 기준을 고정하기 위함

## 데이터셋

### 1000건 기준
- creators: 20
- users: 300
- events: 1000
- watchlists per user: 4
- bookings: 성능 시더가 생성

### 5000건 기준
- creators: 20
- users: 300
- events: 5000
- watchlists per user: 4
- bookings: 성능 시더가 생성

### 10000건 기준
- creators: 20
- users: 300
- events: 10000
- 확장 방식: 기존 5000건 성능 데이터 위에 이벤트만 증분 확장
- 주의: 10000건 시드에서는 부하 시간을 줄이기 위해 신규 이벤트에 대한 bookings/watchlists 확장은 생략

## 실행 조건 메모
- 1000건과 5000건은 `PERF_RESET_DATA=true` 리셋 시드 방식으로 생성
- 10000건은 watchlists 삭제 단계의 lock wait timeout을 피하기 위해 `PERF_RESET_DATA=false` 증분 시드 방식으로 생성
- 10000건 측정은 임시 서버 `http://localhost:8083` 기준으로 실행
- 3차 검색 최적화 측정은 별도 서버 `http://localhost:8085` 기준으로 실행
- k6 출력의 `listen tcp 127.0.0.1:6565` 경고는 로깅 수집 포트 충돌 경고였고 최종 비교표에는 측정값만 반영

## 기준선 측정 결과

### 공개 이벤트 탐색 조회 기준선

| 시나리오 | Baseline p95 | 해석 |
| --- | ---: | --- |
| 기본 목록 | 540.80ms | 10000건에서 홈 화면 공개 목록 지연이 뚜렷하게 상승 |
| 검색 `QUERY=Performance` | 683.15ms | 검색 경로가 가장 비싼 경로로 확인 |
| 카테고리 `Concert` | 499.65ms | 결과 집합이 줄어도 탐색 비용은 여전히 큼 |
| `SECTION=trending` | 619.43ms | 계산식 정렬과 필터 비용이 같이 의심됨 |
| `PAGE=3` | 232.36ms | 페이지 증가 영향은 있지만 검색보다 약함 |

관찰:
- 공개 이벤트 탐색 조회는 `1000 -> 5000` 구간에서는 비교적 안정적이었다.
- `5000 -> 10000` 구간에서 p95가 급격히 상승했다.
- 기본 목록, 검색, trending이 함께 느려진 점을 보면 특정 분기 하나보다 공통 조회 구조 비용 증가 가능성이 높았다.

### 크리에이터 워크스페이스 비교

| 시나리오 | 1000 p95 | 5000 p95 | 10000 p95 | 해석 |
| --- | ---: | ---: | ---: | --- |
| 기본 목록 | 16.79ms | 24.92ms | 47.85ms | 증가하긴 하지만 공개 이벤트 탐색 조회보다 훨씬 낮음 |
| `FILTER=editable` | 8.59ms | 20.99ms | 45.39ms | 데이터 증가에 비례한 완만한 상승 |
| `SORT=mostReserved` | 13.00ms | 27.61ms | 46.34ms | 정렬 비용은 있지만 아직 안정권 |
| `PAGE=2` | 10.69ms | 18.87ms | 18.70ms | 페이지 영향은 작음 |

해석:
- `my-events`도 느려지지만 공개 이벤트 탐색 조회보다 증가폭이 훨씬 작다.
- 이번 최적화의 첫 번째 우선순위는 아니었다.

### 예약 워크스페이스 비교

| 시나리오 | 1000 p95 | 5000 p95 | 10000 p95 | 해석 |
| --- | ---: | ---: | ---: | --- |
| 기본 목록 | 25.04ms | 19.27ms | 99.36ms | 10000건에서 상승, 다만 증분 시드 특성을 감안해야 함 |
| `STATUS=CONFIRMED` | 27.24ms | 27.70ms | 81.62ms | 상태 필터에서도 응답시간 증가 |
| `PAGE=2` | 23.01ms | 23.17ms | 92.36ms | 10000 환경에서 상승 |

주의:
- 10000건 시드에서는 신규 이벤트에 대한 bookings 확장을 생략했기 때문에 `my-bookings`는 순수한 2배 데이터 증가 비교가 아니다.
- 따라서 `my-bookings` 10000 결과는 참고치로 해석한다.

## 문제 정의와 가설

### 문제 정의
- 가장 강한 성능 저하는 공개 이벤트 탐색 조회에서 관찰됐다.
- 특히 `GET /api/v1/events`의 기본 목록, 검색, `trending`이 10000건에서 함께 느려졌다.
- 반면 `my-events`, `my-bookings`는 느려지긴 했지만 증가폭이 훨씬 작았다.

### 1차 가설
- `countQuery`가 실제 목록 조회와 비슷한 수준의 join 비용을 계속 안고 있을 수 있다.
- 특히 검색이 없는 요청에서도 `creator`, `inventory` 같은 연관 join이 count에 남아 있다면 불필요하다.

### 2차 가설
- 페이지네이션 전에 무거운 fetch join이 수행되고 있을 수 있다.
- 즉 "이번 페이지에 필요한 20건"을 먼저 고르기 전에 큰 후보 집합 전체에 대한 join 비용을 지불하고 있을 가능성이 있다.

### 3차 가설
- `%keyword%` 기반 텍스트 검색이 tail latency를 끌어올리고 있을 수 있다.
- 특히 긴 텍스트 컬럼까지 포함하면 일반 인덱스로 이득을 보기 어렵다.

## 주요 코드 변경
- 주요 변경 위치: [EventRepositoryImpl.java](/c:/Users/Kang%20JuHyeong/Desktop/project/reserva/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)
- 주요 대상 메서드: `searchDiscoverableEvents()`, `fetchDiscoverableEvents()`

### 1차 변경: `countQuery` 경량화
- 변경 내용:
  - 공개 이벤트 탐색용 `countQuery`를 `from(event)`에서 시작하도록 변경
  - 검색어가 있을 때만 `creator` join
  - `section=trending`일 때만 `inventory` join
  - `section=watchlist`일 때만 `watchlist` join
- 변경 이유:
  - 전체 개수 계산에는 항상 모든 join이 필요하지 않다.
  - 기준 코드 상태에서는 count 계산도 content query에 가까운 join 비용을 안고 있었다.
- 기대 효과:
  - 기본 목록과 카테고리 필터의 count 비용 감소
  - 검색이 없는 요청의 불필요한 join 축소

### 2차 변경: 목록 조회 2단계화
- 변경 내용:
  - 공개 이벤트 탐색 조회를 `ID 페이지 조회 -> 해당 ID만 fetch join` 구조로 분리
  - 1단계에서는 정렬과 페이지 계산에 필요한 최소 join만 사용
  - 2단계에서는 1단계에서 얻은 페이지 대상 ID에 대해서만 `creator`, `inventory` fetch join 수행
- 변경 이유:
  - 1차 최적화 이후에도 count보다 content query 비용 비중이 커 보였다.
  - 기존 방식은 큰 후보 집합 전체에 대해 fetch join과 정렬을 한 번에 처리하는 구조였다.
- 기대 효과:
  - join fetch 범위를 "최종 페이지 결과"로 제한
  - 전체 후보 집합에 대한 과도한 fetch 비용 감소

### 3차 변경: 검색 predicate 경량화
- 변경 내용:
  - 검색 predicate에서 비용이 큰 `description` 검색 제거
  - 최종 검색 대상은 `title`, `location`, `creator.displayName`
- 변경 이유:
  - `%keyword%` 기반 TEXT 탐색 비용이 컸다.
  - 실제 목록 탐색에서 사용자가 많이 기대하는 검색 신호는 제목, 장소, 호스트명에 더 가깝다.
- 기대 효과:
  - 검색 시나리오 p95 감소
  - 기능을 과하게 바꾸지 않으면서 비용 큰 텍스트 탐색 경로 축소

### 검토했지만 채택하지 않은 접근
- FULLTEXT 인덱스와 `MATCH ... AGAINST` 기반 검색을 검토했다.
- 관련 마이그레이션: [V7__add_fulltext_indexes_for_event_discovery.sql](/c:/Users/Kang%20JuHyeong/Desktop/project/reserva/backend/src/main/resources/db/migration/V7__add_fulltext_indexes_for_event_discovery.sql)
- 하지만 현재 QueryDSL/Hibernate 경로에서 HQL parser 문법 예외가 발생해 이번 단계의 최종 대안으로는 채택하지 않았다.
- 따라서 이번 리포트에서는 "검토한 방향"으로만 기록한다.

## 단계별 전후 비교

### 1차 결과: `countQuery` 경량화 후
- 비교 기준:
  - Baseline: 원격 기준 공개 이벤트 탐색 조회 쿼리 구조
  - 1차: `countQuery` 조건부 join 축소
- 측정 서버: `http://localhost:8083`

| 시나리오 | Baseline p95 | 1차 후 p95 | 차이 |
| --- | ---: | ---: | ---: |
| 기본 목록 | 540.80ms | 233.59ms | -56.8% |
| 검색 `QUERY=Performance` | 683.15ms | 311.52ms | -54.4% |
| `SECTION=trending` | 619.43ms | 220.01ms | -64.5% |

해석:
- count 계산 공통 구조 비용이 실제 병목 원인 중 하나였다는 가설이 유효했다.
- `countQuery` 단순화만으로도 공개 이벤트 탐색 조회 p95가 절반 이상 감소했다.

### 2차 결과: 목록 조회 2단계화 후
- 비교 기준:
  - 1차: `countQuery` 경량화 상태
  - 2차: `ID 페이지 조회 -> fetch join` 구조 분리
- 측정 서버: `http://localhost:8083`

| 시나리오 | 1차 후 p95 | 2차 후 p95 | 차이 |
| --- | ---: | ---: | ---: |
| 기본 목록 | 233.59ms | 217.58ms | -6.9% |
| 검색 `QUERY=Performance` | 311.52ms | 296.53ms | -4.8% |
| `SECTION=trending` | 220.01ms | 202.87ms | -7.8% |

해석:
- 1차만큼 큰 폭은 아니지만 모든 시나리오에서 추가 개선이 관찰됐다.
- 남아 있던 비용 일부가 content query fetch 구조에도 있었다는 가설이 유효했다.

### 3차 결과: 검색 predicate 경량화 후
- 비교 기준:
  - 2차: 목록 조회 2단계화 상태
  - 3차: `description` 검색 제거 후 상태
- 측정 서버: `http://localhost:8085`

| 시나리오 | 2차 후 p95 | 3차 후 p95 | 차이 |
| --- | ---: | ---: | ---: |
| 검색 `QUERY=Performance` | 296.53ms | 204.15ms | -31.2% |

해석:
- 설명문 전체를 검색 대상에 포함하는 비용이 컸다는 점을 확인했다.
- 기능을 크게 바꾸지 않으면서도 비용 큰 텍스트 탐색 경로를 줄일 수 있었다.

## 예약 동시성

### 1000건 기준
- 조건: `EVENT_ID=perf_evt_00001`, `VUS=20`, `USER_INDEX_START=200`
- 결과:
  - `p95 = 230.51ms`
  - `http_req_failed = 0.00%`
  - 체크 통과

### 5000건 기준
- 조건: `EVENT_ID=perf_evt_00001`, `VUS=20`, `USER_INDEX_START=200`
- 결과:
  - `p95 = 278.91ms`
  - `http_req_failed = 0.00%`
  - 체크 통과

### 10000건 기준
- 조건: `BASE_URL=http://localhost:8083`, `EVENT_ID=perf_evt_00001`, `VUS=20`, `USER_INDEX_START=200`
- 결과:
  - `p95 = 224.89ms`
  - k6 기준 `http_req_failed = 50.00%`
  - 스크립트 체크는 `100%` 통과

10000건 해석:
- 예약 스크립트는 `201 created` 또는 `409 conflict`를 모두 정상 처리로 본다.
- 따라서 k6 기본 메트릭은 `409`를 실패로 집계해 `http_req_failed`가 높게 보인다.
- 실제 의미는 서버가 동시 요청 중 일부를 정상적으로 충돌 처리했다는 쪽에 가깝다.

DB 확인:
- `perf_evt_00001` 재고: `reserved_slots = 25`, `total_slots = 60`
- `reserved_slots <= total_slots` 유지 확인
- 동일 이벤트의 중복 활성 예약 수 `0`
- 상태 분포: `CONFIRMED 30`, `CANCELLED 1`

판단:
- 비관적 락 기반 동시성 제어는 현재 테스트 범위에서 정합성을 유지했다.
- oversell 징후는 없었다.

## 중간 결론
- 가장 강한 병목 후보는 공개 이벤트 탐색 조회였다.
- `1000 -> 5000`은 비교적 안정적이었고 `5000 -> 10000`에서 공개 목록 조회 p95 상승이 두드러졌다.
- `my-events`는 증가폭이 비교적 작아 현재 개선 우선순위가 더 낮았다.
- 예약 생성은 성능보다 정합성 검증이 우선이었고, 현재 범위에서는 정합성 문제가 없었다.

## 최종 판단
- 이번 성능 작업은 모든 쿼리를 일괄 최적화한 것이 아니라, 실제 측정에서 가장 크게 느려진 홈 화면 공개 이벤트 탐색 조회를 우선 개선한 작업이다.
- 단계별 변경은 아래 순서로 추적했다.
- 1차: `countQuery` 경량화
- 2차: `ID 페이지 조회 -> fetch join` 2단계화
- 3차: 검색 predicate 경량화
- 이후 코드가 더 바뀌더라도 이 리포트의 전후 비교는 기준 커밋 `43a5220`과 위 단계 정의를 기준으로 해석한다.
