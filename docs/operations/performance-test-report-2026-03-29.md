# 성능 테스트 리포트
Date: 2026-03-29

## 목적
- 백엔드 성능 확인에 사용한 로컬 k6 기준선을 기록한다.
- 이번 작업에서 실제로 최적화한 대상과 비교용 측정 대상을 분리해서 남긴다.
- 이후 쿼리 변경 시 전후 비교 기준으로 사용할 수 있도록 기준 상태를 고정한다.

## 범위 요약
이번 리포트에는 성격이 다른 네 가지 테스트 그룹이 들어 있다.

1. 공개 이벤트 탐색 목록
   - API: `GET /api/v1/events`
   - 이 리포트에서의 역할: 주 병목 분석 대상이자 실제 최적화 대상
2. 크리에이터 이벤트 목록
   - API: `GET /api/v1/me/events`
   - 이 리포트에서의 역할: 크리에이터 전용 목록 조회 비교군
3. 내 예약 목록
   - API: `GET /api/v1/me/bookings`
   - 이 리포트에서의 역할: 사용자 전용 목록 조회 비교군
4. 예약 생성 동시성
   - API: `POST /api/v1/events/{eventId}/bookings`
   - 이 리포트에서의 역할: 지연시간 최적화 대상이 아니라 정합성과 oversell 방지 확인

## 기준 코드 상태
- 기준 브랜치: `origin/main`
- 기준 커밋: `43a5220`
- 기준 커밋 메시지: `Merge pull request #27 from KangJuHyeong/feat/event-delete-and-booking-cancel`
- 주요 최적화 대상 코드: [EventRepositoryImpl.java](/c:/Users/KJH/Desktop/project-root/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)의 공개 이벤트 탐색 쿼리 경로
- 주요 검토 메서드:
  - `searchDiscoverableEvents()`
  - `fetchDiscoverableEvents()`

## 데이터셋

### 1000건 시드
- creators: 20
- users: 300
- events: 1000
- watchlists per user: 4
- bookings: 성능 시더가 생성

### 5000건 시드
- creators: 20
- users: 300
- events: 5000
- watchlists per user: 4
- bookings: 성능 시더가 생성

### 10000건 시드
- creators: 20
- users: 300
- events: 10000
- 확장 방식: 5000건 성능 시드 위에 이벤트를 증분 확장
- 주의: 시드 시간을 줄이기 위해 신규 이벤트에 대한 bookings, watchlists는 완전 확장하지 않았다

## 실행 메모
- 1000건과 5000건은 `PERF_RESET_DATA=true`로 생성했다.
- 10000건은 watchlist 정리 단계의 lock wait timeout을 피하기 위해 `PERF_RESET_DATA=false`로 증분 생성했다.
- 일부 10000건 측정은 `http://localhost:8083`에서 수행했다.
- 3차 검색 최적화 확인은 `http://localhost:8085`에서 수행했다.
- k6의 `listen tcp 127.0.0.1:6565` 경고는 보조 로깅 포트 충돌로 보고 최종 해석에는 반영하지 않았다.

## 테스트 그룹 설명

### 1. 공개 이벤트 탐색 목록
- 스크립트: [public-events.js](/c:/Users/KJH/Desktop/project-root/perf/k6/public-events.js)
- API: `GET /api/v1/events`
- 목적:
  - 홈 화면과 이벤트 탐색에 사용되는 공개 목록 경로를 측정
  - 이벤트 수가 커졌을 때 가장 큰 병목이 어디인지 확인
  - 공개 탐색 쿼리의 전후 개선 효과를 검증
- 시나리오:
  - 기본 목록
  - `q=Performance`
  - `category=Concert`
  - `section=trending`
  - `page=3`

### 2. 크리에이터 이벤트 목록
- 스크립트: [my-events.js](/c:/Users/KJH/Desktop/project-root/perf/k6/my-events.js)
- API: `GET /api/v1/me/events`
- 목적:
  - 공개 탐색 외에 크리에이터 전용 목록도 같은 방식으로 느려지는지 확인
  - 더 좁은 인증 목록 쿼리와 비교해 병목이 공개 탐색에 집중되는지 판단
- 시나리오:
  - 기본 목록
  - `filter=editable`
  - `sort=mostReserved`
  - `page=2`

### 3. 내 예약 목록
- 스크립트: [my-bookings.js](/c:/Users/KJH/Desktop/project-root/perf/k6/my-bookings.js)
- API: `GET /api/v1/me/bookings`
- 목적:
  - 사용자 전용 목록 조회도 강한 스케일 저하를 보이는지 확인
  - 공개 이벤트 탐색 외의 비교 기준을 하나 더 확보
- 시나리오:
  - 기본 목록
  - `status=CONFIRMED`
  - `page=2`
- 해석 주의:
  - 10000건 시드는 신규 이벤트에 대한 booking 확장을 일부 생략했기 때문에 완전한 동등 비교 데이터는 아니다

### 4. 예약 생성 동시성
- 스크립트: [create-booking.js](/c:/Users/KJH/Desktop/project-root/perf/k6/create-booking.js)
- API: `POST /api/v1/events/{eventId}/bookings`
- 목적:
  - 동시 요청 상황에서 예약 정합성이 유지되는지 확인
  - 중복 예약과 oversell 방지가 깨지지 않는지 확인
- 이 섹션은 지연시간 최적화 리포트라기보다 정합성 검증 결과로 읽는 것이 맞다.

## 기준선 결과

### 주 대상: 공개 이벤트 탐색 목록

| 시나리오 | p95 | 해석 |
| --- | ---: | --- |
| 기본 목록 | 540.80ms | 10000건에서 지연시간 상승이 뚜렷했다 |
| 검색 `q=Performance` | 683.15ms | 가장 비싼 탐색 경로였다 |
| 카테고리 `Concert` | 499.65ms | 결과 수가 줄어도 쿼리 비용이 여전히 컸다 |
| `section=trending` | 619.43ms | 파생 섹션 계산과 정렬 비용이 의심됐다 |
| `page=3` | 232.36ms | 페이지 증가 영향은 있지만 검색과 trending보다 덜 무거웠다 |

관찰:
- 가장 강한 성능 저하는 공개 이벤트 탐색 경로에서 나타났다.
- `1000 -> 5000`보다 `5000 -> 10000` 구간의 상승이 훨씬 컸다.
- 기본 목록, 검색, trending이 같이 느려졌기 때문에 특정 분기 하나보다 공통 조회 구조가 더 의심됐다.

### 비교군: 크리에이터 이벤트 목록

| 시나리오 | 1000 p95 | 5000 p95 | 10000 p95 | 해석 |
| --- | ---: | ---: | ---: | --- |
| 기본 목록 | 16.79ms | 24.92ms | 47.85ms | 데이터가 늘어도 공개 탐색보다 훨씬 낮았다 |
| `filter=editable` | 8.59ms | 20.99ms | 45.39ms | 완만한 증가 수준이었다 |
| `sort=mostReserved` | 13.00ms | 27.61ms | 46.34ms | 정렬 비용은 있으나 전체적으로 안정적이었다 |
| `page=2` | 10.69ms | 18.87ms | 18.70ms | 페이지 영향은 크지 않았다 |

해석:
- `GET /api/v1/me/events`도 느려지긴 했지만 첫 번째 최적화 대상이 될 정도는 아니었다.
- 즉 이벤트 관련 목록 전체가 아니라 공개 탐색 경로에 병목이 더 집중되어 있다는 판단을 뒷받침했다.

### 비교군: 내 예약 목록

| 시나리오 | 1000 p95 | 5000 p95 | 10000 p95 | 해석 |
| --- | ---: | ---: | ---: | --- |
| 기본 목록 | 25.04ms | 19.27ms | 99.36ms | 10000건에서 상승했지만 시드 차이를 감안해야 한다 |
| `status=CONFIRMED` | 27.24ms | 27.70ms | 81.62ms | 상태 필터에서도 10000건에서 증가했다 |
| `page=2` | 23.01ms | 23.17ms | 92.36ms | 가장 큰 환경에서 응답시간이 높아졌다 |

해석:
- `GET /api/v1/me/bookings`도 느려지는 경향은 보였지만 10000건 데이터셋이 완전한 동등 비교는 아니다.
- 따라서 이 결과는 주 최적화 근거라기보다 참고용 보조 지표로 해석했다.

## 병목 정의
- 이번에 실제로 최적화할 가치가 가장 컸던 대상은 `GET /api/v1/events` 공개 탐색 엔드포인트였다.
- 특히 기본 목록, 검색, `trending` 시나리오가 가장 아픈 지점이었다.
- 크리에이터 이벤트 목록과 내 예약 목록은 시야를 좁히지 않기 위한 비교군으로 측정했지만, 이번 데이터에서는 가장 강한 병목은 아니었다.

## 문제를 좁혀간 흐름
이번 작업은 처음부터 `countQuery`, `predicate`, `fetch join`을 손보자고 정해두고 시작한 것이 아니다. 먼저 공개 이벤트 탐색 API가 실제로 가장 많이 느려지는지 확인했고, 그다음 코드를 보면서 "왜 기본 목록, 검색, trending이 같이 느려지는가"를 역으로 추적했다.

흐름은 아래와 같았다.

1. 공개 이벤트 탐색 API가 비교군보다 훨씬 크게 느려진다는 사실을 먼저 확인했다.
   - `GET /api/v1/events`는 10000건에서 기본 목록, 검색, trending이 모두 함께 느려졌다.
   - 반면 `GET /api/v1/me/events`, `GET /api/v1/me/bookings`는 느려지긴 해도 같은 급의 악화는 아니었다.
   - 그래서 "이벤트 목록 전부가 문제"라기보다 "공개 탐색 쿼리 구조 자체"를 먼저 의심하게 됐다.
2. 그다음 [EventRepositoryImpl.java](/c:/Users/KJH/Desktop/project-root/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)의 `searchDiscoverableEvents()`를 열어 공개 탐색 쿼리 흐름을 확인했다.
   - 이 메서드는 공개 이벤트 목록 API의 중심 QueryDSL 쿼리다.
   - 여기서 필터 조건, 검색 조건, 섹션 분기, count, 목록 조회가 모두 한 흐름 안에 묶여 있었다.
3. 코드상에서 먼저 눈에 띈 것은 "count 쿼리도 생각보다 무겁다"는 점이었다.
   - 목록 API는 보통 "이번 페이지 데이터"와 "전체 개수 total"을 같이 구한다.
   - 그런데 이전 코드에서는 count를 셀 때도 `creator`, `inventory`를 기본으로 조인하고 있었다.
   - 기본 목록처럼 검색어도 없고 trending도 아닌 경우에도 이런 join 비용을 내고 있었기 때문에 1차에서 먼저 이 부분을 줄였다.
4. 1차 후에도 공개 목록이 여전히 비싸 보였기 때문에, 다음으로는 실제 데이터 조회 방식 자체를 다시 봤다.
   - 이전 구조는 페이지 대상을 좁히기 전부터 `creator`, `inventory`를 fetch join한 상태로 정렬과 페이지네이션을 처리하고 있었다.
   - 이 방식은 후보 집합이 커질수록 불리할 수 있어서, 2차에서는 "id만 먼저 뽑고 나중에 필요한 행만 fetch join"하는 구조로 나눴다.
5. 마지막으로 검색 시나리오만 유독 더 비싼 이유를 보려고 `searchPredicate()`를 확인했다.
   - 검색 대상에 `description`이 포함되어 있었다.
   - 긴 텍스트 필드의 `%keyword%` 검색은 비용이 크기 때문에, 실제 검색 의도에 더 가까운 필드만 남기고 `description`을 제거했다.

즉 이번 최적화 흐름은 "측정 -> 공개 탐색이 제일 느림 확인 -> `searchDiscoverableEvents()` 구조 확인 -> count 단순화 -> 조회 방식 분리 -> 검색 범위 축소" 순서였다.

## 작업 가설

### 가설 1: `countQuery`가 너무 무겁다
- count 경로가 content query에 가까운 join 비용을 계속 안고 있을 수 있다.
- `creator`, `inventory`, `watchlist` 같은 join은 요청 조건이 실제로 필요할 때만 붙는 편이 낫다.

### 가설 2: fetch join이 너무 이르게 들어간다
- 최종 페이지 범위를 좁히기 전에 fetch join 비용을 크게 지불하고 있을 수 있다.
- 조회를 두 단계로 나누면 join 대상 범위를 줄일 수 있다.

### 가설 3: 검색 범위가 tail latency를 키운다
- `description` 같은 큰 텍스트 컬럼에 `%keyword%` 검색을 거는 비용이 과도할 수 있다.
- 실제 사용자 검색 의도에 가까운 필드만 남기면 비용 대비 효율이 더 나을 수 있다.

## 최적화 변경 내용

### 변경 1: `countQuery` 경량화
이 단계는 "전체 개수를 세는 쿼리까지 왜 이렇게 무거운가?"라는 질문에서 시작했다.

이전 코드에서는 공개 탐색 목록을 조회할 때 count query가 아래처럼 항상 `creator`, `inventory`를 같이 붙이고 있었다.

```java
JPAQuery<Long> countQuery = queryFactory.select(event.count())
        .from(event)
        .join(event.creator, creator)
        .join(event.inventory, inventory);
```

이 구조의 문제는, 실제로는 검색어가 없거나 `trending`이 아닌 요청에서도 count를 세기 위해 매번 연관 테이블 join 비용을 지불한다는 점이다. 페이지네이션에 필요한 `total`을 구하는 쿼리인데, 내용 조회에 가까운 무게를 갖고 있었던 셈이다.

- 변경 내용:
  - 공개 탐색 `countQuery`를 `event` 기준으로 단순화
  - 검색어가 있을 때만 `creator` join
  - `section=trending`일 때만 `inventory` join
  - `section=watchlist`일 때만 `watchlist` join
- 이유:
  - count query는 content query와 같은 join 그래프가 항상 필요하지 않다
  - 기준선 측정상 count 쿼리의 공통 구조 비용이 과도해 보였다

현재 코드는 [EventRepositoryImpl.java](/c:/Users/KJH/Desktop/project-root/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)의 `searchDiscoverableEvents()` 안에서 이걸 조건부로 바꿔두었다.
- 검색어가 있을 때만 `creator` join
- `TRENDING`일 때만 `inventory` join
- `WATCHLIST`일 때만 `watchlist` join

즉 1차의 핵심은 "count query를 무조건 무겁게 만들지 말고, 필요한 경우에만 join하자"였다.

### 변경 2: 목록 조회를 2단계로 분리
1차 이후에도 기본 목록과 검색이 여전히 느렸기 때문에, 이번에는 "실제 이벤트 목록을 가져오는 방식" 자체를 다시 봤다.

이전 구조는 공개 이벤트 목록을 가져올 때 처음부터 아래처럼 fetch join이 붙은 상태로 정렬과 페이지네이션을 같이 처리했다.

```java
JPAQuery<EventEntity> contentQuery = queryFactory.selectFrom(event)
        .join(event.creator, creator).fetchJoin()
        .join(event.inventory, inventory).fetchJoin();
```

이 방식은 한 번에 끝나서 코드가 단순해 보이지만, 후보 집합이 큰 경우에는 "이번 페이지에 들어갈 행을 확정하기도 전에" 관련 데이터를 무겁게 끌고 다니게 된다. 특히 공개 탐색처럼 필터와 정렬이 섞인 목록에서는 그 비용이 커질 수 있다.

- 변경 내용:
  - 1단계: 필터와 정렬에 필요한 최소 join만으로 페이지 대상 id 조회
  - 2단계: 그 id들에 대해서만 `creator`, `inventory` fetch join
- 이유:
  - 후보 집합 전체에 대한 fetch join 비용을 줄일 수 있다
  - 비싼 join 작업을 최종 페이지 범위로 제한할 수 있다

현재 코드는 이 흐름을 두 단계로 나눈다.

1. 먼저 `contentIdQuery`로 이번 페이지에 들어갈 `event.id`만 조회한다.
2. 그다음 `fetchDiscoverableEvents(pageEventIds)`를 호출해서 해당 id들만 fetch join으로 다시 읽는다.

즉 "페이지 id 조회 후 제한된 fetch join"이라는 표현은, DB에서 먼저 "이번 페이지 후보 20개 id"를 고른 뒤 그 20개에 대해서만 상세 조회를 한다는 뜻이다. 예전처럼 후보 집합 전체를 상대로 fetch join을 섞은 상태에서 정렬과 페이지네이션을 다 처리하지 않는다는 점이 핵심이다.

### 변경 3: 검색 predicate 범위 축소
앞의 두 단계는 공통 조회 구조를 줄이는 작업이었다면, 3차는 검색 시나리오 자체를 더 가볍게 만드는 작업이었다.

여기서 `predicate`는 쉽게 말해 `where` 절 조건 묶음이다. 현재 [EventRepositoryImpl.java](/c:/Users/KJH/Desktop/project-root/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)의 `searchPredicate()`는 검색어가 들어왔을 때 어떤 필드를 대상으로 검색할지 정한다.

이전 코드에서는 검색 대상이 아래와 같았다.
- `title`
- `description`
- `location`
- `creator.displayName`

그런데 `description`은 보통 길이가 긴 텍스트라 `%keyword%` 검색 비용이 크다. 실제 사용자 입장에서는 이벤트 검색에서 제목, 장소, 작성자명이 더 직접적인 검색 신호일 가능성이 높기 때문에, 성능 대비 효용이 낮은 필드부터 제거하는 쪽이 자연스럽다고 판단했다.

- 변경 내용:
  - 검색 대상에서 `description` 제거
  - `title`, `location`, `creator.displayName` 유지
- 이유:
  - 긴 텍스트 검색 비용이 실제 탐색 가치에 비해 컸다
  - 사용자 검색 의도는 제목, 장소, 작성자명에 더 가까울 가능성이 높다

즉 3차는 "검색 기능을 없앴다"가 아니라 "검색 조건 중 가장 비싼 필드를 빼서 tail latency를 줄였다"에 가깝다.

### 검토했지만 채택하지 않은 방향
- FULLTEXT 인덱스와 `MATCH ... AGAINST` 방식도 검토했다.
- 관련 파일: [V7__add_fulltext_indexes_for_event_discovery.sql](/c:/Users/KJH/Desktop/project-root/backend/src/main/resources/db/migration/V7__add_fulltext_indexes_for_event_discovery.sql)
- 다만 현재 QueryDSL, Hibernate 경로와 맞물리는 과정에서 parser와 통합 이슈가 있어 이번 최종안으로는 채택하지 않았다.

## 전후 비교

### 1차: `countQuery` 단순화
- 비교 기준:
  - 기준선: 기존 공개 탐색 쿼리 구조
  - 1차: `countQuery`의 조건부 join 축소
- 측정 서버: `http://localhost:8083`

| 시나리오 | 기준선 p95 | 1차 p95 | 변화폭 |
| --- | ---: | ---: | ---: |
| 기본 목록 | 540.80ms | 233.59ms | -56.8% |
| 검색 `q=Performance` | 683.15ms | 311.52ms | -54.4% |
| `section=trending` | 619.43ms | 220.01ms | -64.5% |

해석:
- count query의 공통 비용이 실제 병목의 한 축이었다는 점이 확인됐다.
- 이번 리포트에서 가장 큰 단일 개선 효과는 이 단계에서 나왔다.
- 즉 "전체 개수 total을 세는 쿼리"를 가볍게 만든 것만으로도 전체 응답시간이 크게 내려갔다는 뜻이다.

### 2차: 목록 조회 2단계화
- 비교 기준:
  - 1차: 경량화된 `countQuery`
  - 2차: 페이지 id 조회 후 제한된 fetch join
- 측정 서버: `http://localhost:8083`

| 시나리오 | 1차 p95 | 2차 p95 | 변화폭 |
| --- | ---: | ---: | ---: |
| 기본 목록 | 233.59ms | 217.58ms | -6.9% |
| 검색 `q=Performance` | 311.52ms | 296.53ms | -4.8% |
| `section=trending` | 220.01ms | 202.87ms | -7.8% |

해석:
- 1차만큼 크지는 않지만 모든 공개 탐색 시나리오에서 추가 개선이 있었다.
- content query 쪽 fetch 구조도 성능에 영향을 주고 있었다는 해석이 가능하다.
- 즉 count만의 문제가 아니라, "이번 페이지 데이터를 읽어오는 방식" 자체도 비용이 있었다는 뜻이다.

### 3차: 검색 predicate 축소
- 비교 기준:
  - 2차: 목록 조회 2단계화 상태
  - 3차: `description` 제거 상태
- 측정 서버: `http://localhost:8085`

| 시나리오 | 2차 p95 | 3차 p95 | 변화폭 |
| --- | ---: | ---: | ---: |
| 검색 `q=Performance` | 296.53ms | 204.15ms | -31.2% |

해석:
- 검색 대상 범위 자체가 tail latency에 의미 있는 영향을 주고 있었다.
- 검색 스택 전체를 바꾸지 않고도 가장 비싼 검색 경로를 줄일 수 있었다.
- 즉 검색 성능 저하의 일부는 검색 대상 필드 구성이 너무 넓었던 데서 왔다고 볼 수 있다.

## 예약 생성 동시성 정합성 확인

### 조건
- 대상 이벤트: `perf_evt_00001`
- `VUS=20`
- `USER_INDEX_START=200`

### 결과

| 데이터셋 | p95 | http_req_failed | 체크 결과 |
| --- | ---: | ---: | --- |
| 1000 events | 230.51ms | 0.00% | pass |
| 5000 events | 278.91ms | 0.00% | pass |
| 10000 events | 224.89ms | 50.00% | script check pass |

### 해석
- 이 시나리오에서는 `201 Created`와 `409 Conflict`를 모두 허용 가능한 결과로 보았다.
- 10000건에서 `http_req_failed`가 높게 보인 이유는 k6가 기본적으로 `409`를 실패로 집계하기 때문이다.
- 더 중요한 판단 기준은 동시 예약 시에도 재고와 예약 정합성이 유지되었는가였다.

### DB 확인
- `perf_evt_00001`: `reserved_slots = 25`, `total_slots = 60`
- `reserved_slots <= total_slots` 유지
- 동일 이벤트에 대한 활성 중복 예약 수: `0`
- 예약 상태 분포: `CONFIRMED 30`, `CANCELLED 1`

결론:
- 비관적 락 기반 예약 제어는 테스트 범위 안에서 정합성을 유지했다.
- oversell 징후는 없었다.

## 최종 결론
- 이번 리포트의 실제 최적화 대상은 공개 탐색 엔드포인트 `GET /api/v1/events`였다.
- `GET /api/v1/me/events`와 `GET /api/v1/me/bookings`는 저하가 공개 탐색에만 집중되는지 확인하기 위한 비교군이었다.
- 예약 생성 동시성은 응답속도 최적화보다 정합성 검증에 가까운 별도 축이었다.
- 가장 큰 개선 폭은 `countQuery` 단순화에서 나왔고, 이후 fetch 범위 축소와 검색 predicate 축소가 뒤를 이었다.
- 이후 비교도 기준 커밋 `43a5220`을 기준으로 해석하는 것이 맞다.
