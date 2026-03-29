# 성능 테스트 가이드

이 문서는 Reserva 백엔드 API의 로컬 성능 테스트 기준과 실행 순서를 정리한다.

## 목적
- README에 넣을 성능 근거를 만들기 전에 재현 가능한 측정 환경을 만든다
- 공개 조회와 예약 동시성에서 병목 후보를 수치로 확인한다
- 이후 최적화 결과를 단계별 before/after로 누적 기록한다

## 기준 상태 관리
- 성능 리포트에는 항상 `측정 당시 기준 커밋`을 함께 적는다
- 이후 코드가 바뀌더라도 이전 수치는 해당 기준 커밋 기준으로 해석한다
- 추가 최적화가 생기면 `N차 최적화 전/후` 표를 새로 누적한다
- 이번 1차 성능 작업의 기준 커밋은 `43a5220`이다

## 준비

### k6 설치
Windows 예시:
```powershell
winget install --id Grafana.k6 -e
```

또는:
```powershell
choco install k6
```

설치 확인:
```powershell
k6 version
```

### 백엔드 실행
```powershell
cd backend
.\run-local.ps1
```

## 성능 시드 설정

### 기본 성능 시드
`backend/.env`
```env
SEED_DEMO_DATA=false
SEED_PERFORMANCE_DATA=true
PERF_RESET_DATA=true
PERF_CREATOR_COUNT=20
PERF_USER_COUNT=300
PERF_EVENT_COUNT=1000
PERF_WATCHLISTS_PER_USER=4
PERF_RANDOM_SEED=20260329
```

설명:
- `PERF_RESET_DATA=true`
  - 기존 `perf_*` 데이터를 지우고 다시 생성한다
- `PERF_EVENT_COUNT`
  - 공개 조회 테스트 비교의 핵심 기준값이다

샘플 계정:
- creator: `perf-creator-00001@example.com`
- user: `perf-user-00001@example.com`

기준 이벤트:
- `perf_evt_00001`

### 증분 확장 시드
`5000 -> 10000`처럼 이벤트만 빠르게 확장할 때는 아래처럼 사용한다.

```env
SEED_DEMO_DATA=false
SEED_PERFORMANCE_DATA=true
PERF_RESET_DATA=false
PERF_CREATOR_COUNT=20
PERF_USER_COUNT=300
PERF_EVENT_COUNT=10000
PERF_WATCHLISTS_PER_USER=4
PERF_RANDOM_SEED=20260329
```

증분 모드 메모:
- 기존 `perf_*` 데이터를 유지한 채 부족한 이벤트만 추가한다
- 현재 증분 모드에서는 scale-up 속도를 위해 신규 이벤트에 대한 bookings/watchlists 확장을 생략한다
- 따라서 `10000` 세트의 `my-bookings` 결과는 참고치로 해석한다

## 시드 확인
```powershell
curl.exe "http://localhost:8080/api/v1/events?page=1&size=1"
```

확인 포인트:
- `total`이 기대 이벤트 수와 일치하는지
- `perf_evt_*` 이벤트가 보이는지

## k6 실행

### 공개 조회
기본:
```powershell
k6 run perf/k6/public-events.js
```

변형:
```powershell
$env:QUERY="Performance"; k6 run perf/k6/public-events.js
$env:CATEGORY="Concert"; k6 run perf/k6/public-events.js
$env:SECTION="trending"; k6 run perf/k6/public-events.js
$env:PAGE="3"; k6 run perf/k6/public-events.js
```

### 크리에이터 워크스페이스
기본:
```powershell
k6 run perf/k6/my-events.js
```

변형:
```powershell
$env:FILTER="editable"; k6 run perf/k6/my-events.js
$env:SORT="mostReserved"; k6 run perf/k6/my-events.js
$env:PAGE="2"; k6 run perf/k6/my-events.js
```

### 예약 워크스페이스
기본:
```powershell
k6 run perf/k6/my-bookings.js
```

변형:
```powershell
$env:STATUS="CONFIRMED"; k6 run perf/k6/my-bookings.js
$env:PAGE="2"; k6 run perf/k6/my-bookings.js
```

### 예약 동시성
```powershell
$env:EVENT_ID="perf_evt_00001"
$env:VUS="20"
$env:USER_INDEX_START="200"
k6 run perf/k6/create-booking.js
```

설명:
- `USER_INDEX_START`를 지정하면 기존 예약 충돌을 줄이기 쉽다
- 현재 스크립트는 `201` 또는 `409`를 정상 동작으로 본다
- k6 기본 `http_req_failed` 메트릭은 `409`를 실패로 집계하므로 체크 결과와 함께 해석해야 한다

## 임시 포트 서버 기준 실행
포트 충돌이나 별도 검증이 필요할 때는 임시 포트 서버를 띄운다.

예시:
```powershell
$env:BASE_URL="http://localhost:8083"
k6 run perf/k6/public-events.js
```

같은 방식으로 `my-events.js`, `my-bookings.js`, `create-booking.js`에도 `BASE_URL`을 붙일 수 있다.

## 기록할 지표
- `p50`
- `p95`
- 실패율
- 처리량
- 관찰된 쿼리 병목 후보

## 현재 분석 우선순위
- [EventRepositoryImpl.java](/c:/Users/Kang%20JuHyeong/Desktop/project/reserva/backend/src/main/java/com/reserva/backend/event/EventRepositoryImpl.java)
- discovery `countQuery`
- 검색 predicate
- `fillRateExpression`
- `trending` / `endingSoon` 분기
- 필요한 경우 인덱스 검토

## 참고 문서
- [성능 테스트 리포트](./performance-test-report-2026-03-29.md)
