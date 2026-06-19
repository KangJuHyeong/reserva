# README Product Demo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the README as a local, product-demo-focused portfolio page with rich screenshots and one backend highlight: concurrent reservation correctness.

**Architecture:** Keep the product implementation intact and improve the portfolio surface around it. Extend existing demo seed data for repeatable screenshots, repair visible Korean UI copy on screenshot routes, add a small local concurrency verification artifact, capture browser screenshots into `docs/assets/readme/`, then rewrite `README.md` around those assets.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Spring Boot, Spring Security, Spring Data JPA, QueryDSL, MySQL, Redis, Flyway, Docker Compose, PowerShell, Playwright or in-app browser screenshot capture.

---

## File Structure

Files to modify:
- `backend/src/main/java/com/reserva/backend/dev/DevDataSeeder.java`: add README-ready demo bookings, watchlists, and event states.
- `backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java`: add focused tests for seeded users, bookings, watchlists, and inventory state. Create this file if it does not exist.
- `frontend/components/home-page.tsx`: repair visible Korean copy used on home/discovery screenshots.
- `frontend/app/page.tsx`: repair backend-unavailable Korean fallback copy if still corrupted.
- `frontend/components/*.tsx` on screenshot routes: repair only visible Korean copy that appears in target screenshots.
- `scripts/readme-concurrency-check.ps1`: create a local API-level verification script that produces a concise concurrency evidence file.
- `docs/assets/readme/`: create this directory and store README screenshots plus generated concurrency evidence.
- `README.md`: rewrite as the final product-demo portfolio README.

Files to inspect during implementation:
- `backend/src/main/java/com/reserva/backend/booking/BookingService.java`
- `backend/src/main/java/com/reserva/backend/booking/RedisBookingAdmissionGuard.java`
- `backend/src/test/java/com/reserva/backend/booking/BookingServiceTest.java`
- `frontend/components/reservation-card.tsx`
- `frontend/components/event-detail-client.tsx`
- `frontend/components/dashboard-page.tsx`
- `frontend/components/my-events-page.tsx`
- `frontend/components/create-event-form.tsx`
- `frontend/components/login-form.tsx`
- `infra/local/compose.yml`
- `backend/src/main/resources/application.yml`

## Task 1: Add README-Ready Demo Data Tests

**Files:**
- Create: `backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java`
- Modify later: `backend/src/main/java/com/reserva/backend/dev/DevDataSeeder.java`

- [ ] **Step 1: Write the failing seed coverage test**

Create `backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java` with a slice-style unit test around the current seeder behavior. Use mocks rather than a full Spring context so the test runs quickly.

```java
package com.reserva.backend.dev;

import com.reserva.backend.booking.BookingRepository;
import com.reserva.backend.common.model.UserRole;
import com.reserva.backend.event.EventEntity;
import com.reserva.backend.event.EventRepository;
import com.reserva.backend.event.model.EventStatus;
import com.reserva.backend.event.model.EventVisibility;
import com.reserva.backend.user.UserRepository;
import com.reserva.backend.watchlist.WatchlistRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DevDataSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void seedsPortfolioDemoUsersEventsBookingsAndWatchlists() {
        List<Object> persisted = new ArrayList<>();
        lenient().when(passwordEncoder.encode("dev-password")).thenReturn("encoded-dev-password");
        lenient().when(entityManager.persist(any())).thenAnswer(invocation -> {
            Object entity = invocation.getArgument(0);
            persisted.add(entity);
            return null;
        });
        lenient().when(userRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(eventRepository.findById(any())).thenReturn(Optional.empty());
        lenient().when(watchlistRepository.existsByUserIdAndEventId(any(), any())).thenReturn(false);
        lenient().when(bookingRepository.existsByUserIdAndEventIdAndStatusIn(any(), any(), any())).thenReturn(false);

        DevDataSeeder seeder = new DevDataSeeder(
                userRepository,
                eventRepository,
                watchlistRepository,
                bookingRepository,
                entityManager,
                passwordEncoder
        );

        seeder.run(new DefaultApplicationArguments());

        ArgumentCaptor<Object> persistCaptor = ArgumentCaptor.forClass(Object.class);
        verify(entityManager, org.mockito.Mockito.atLeastOnce()).persist(persistCaptor.capture());

        List<Object> entities = persistCaptor.getAllValues();
        assertThat(entities).anySatisfy(entity -> assertThat(entity).hasFieldOrPropertyWithValue("email", "alex@example.com"));
        assertThat(entities).anySatisfy(entity -> assertThat(entity).hasFieldOrPropertyWithValue("email", "creator@example.com"));

        List<EventEntity> events = entities.stream()
                .filter(EventEntity.class::isInstance)
                .map(EventEntity.class::cast)
                .toList();
        assertThat(events).hasSizeGreaterThanOrEqualTo(10);
        assertThat(events).allSatisfy(event -> {
            assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
            assertThat(event.getVisibility()).isEqualTo(EventVisibility.PUBLIC);
        });
        assertThat(events).anySatisfy(event -> assertThat(event.getInventory().getRemainingSlots()).isLessThanOrEqualTo(5));
        assertThat(events).anySatisfy(event -> assertThat(event.getReservationOpenDateTime()).isAfter(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC)));
        assertThat(events).anySatisfy(event -> assertThat(event.getCreator().getRole()).isEqualTo(UserRole.CREATOR));

        assertThat(entities).anySatisfy(entity -> assertThat(entity.getClass().getSimpleName()).isEqualTo("BookingEntity"));
        assertThat(entities).anySatisfy(entity -> assertThat(entity.getClass().getSimpleName()).isEqualTo("WatchlistEntity"));
    }
}
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
cd backend
.\gradlew.bat test --tests com.reserva.backend.dev.DevDataSeederTest
```

Expected: FAIL because `DevDataSeeder` does not yet accept `BookingRepository` and does not seed demo bookings.

- [ ] **Step 3: Commit only the failing test**

```powershell
git add backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java
git commit -m "test: describe readme demo seed data"
```

## Task 2: Extend Demo Seed Data For Product Screenshots

**Files:**
- Modify: `backend/src/main/java/com/reserva/backend/dev/DevDataSeeder.java`
- Test: `backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java`

- [ ] **Step 1: Add booking dependencies to `DevDataSeeder`**

Modify imports and fields:

```java
import com.reserva.backend.booking.BookingEntity;
import com.reserva.backend.booking.BookingRepository;
import com.reserva.backend.booking.model.BookingStatus;

import java.util.EnumSet;
```

Add a repository field:

```java
private final BookingRepository bookingRepository;
```

Update the constructor signature:

```java
public DevDataSeeder(UserRepository userRepository,
                     EventRepository eventRepository,
                     WatchlistRepository watchlistRepository,
                     BookingRepository bookingRepository,
                     EntityManager entityManager,
                     PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.eventRepository = eventRepository;
    this.watchlistRepository = watchlistRepository;
    this.bookingRepository = bookingRepository;
    this.entityManager = entityManager;
    this.passwordEncoder = passwordEncoder;
}
```

- [ ] **Step 2: Add stable demo event IDs for screenshot states**

Add constants near the existing demo constants:

```java
private static final String DEMO_BOOKABLE_EVENT_ID = "evt_demo_jazz";
private static final String DEMO_ALMOST_FULL_EVENT_ID = "evt_demo_rooftop_last_call";
private static final String DEMO_SOLD_OUT_EVENT_ID = "evt_demo_chef_waitlist";
private static final String DEMO_OPENING_SOON_EVENT_ID = "evt_demo_art";
private static final String DEMO_BOOKING_ID = "bkg_demo_alex_jazz";
private static final String DEMO_BOOKING_CODE = "BK-2026-DEMOJAZZ";
```

- [ ] **Step 3: Expand `SEED_EVENTS` with rich product states**

Keep the existing events and add at least two more definitions. Ensure one is nearly full and one is sold out. Add fields to the `SeedEventDefinition` record for initial reserved slots:

```java
private record SeedEventDefinition(
        String id,
        String title,
        EventCategory category,
        String description,
        String imageUrl,
        String location,
        String price,
        int eventOffsetDays,
        int reservationOpenOffsetDays,
        int maxTicketsPerBooking,
        int totalSlots,
        int reservedSlots
) {
}
```

Update all existing `SeedEventDefinition` calls to pass `reservedSlots`. Use values like:

```java
new SeedEventDefinition(
        DEMO_BOOKABLE_EVENT_ID,
        "Summer Jazz Night",
        EventCategory.CONCERT,
        "An intimate late-night jazz session with a standing-room crowd and seasonal menu.",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
        "Blue Note Jazz Club, Seoul",
        "45.00",
        7,
        -1,
        4,
        120,
        86
),
new SeedEventDefinition(
        DEMO_ALMOST_FULL_EVENT_ID,
        "Rooftop Indie Sunset: Last Call",
        EventCategory.CONCERT,
        "A high-demand rooftop performance with only a few seats left for the final booking wave.",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        "Hangang Rooftop Stage, Seoul",
        "32.00",
        6,
        -2,
        2,
        30,
        27
),
new SeedEventDefinition(
        DEMO_SOLD_OUT_EVENT_ID,
        "Chef's Table Tasting Journey",
        EventCategory.RESTAURANT,
        "A sold-out seasonal tasting menu with live plating commentary from the head chef.",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
        "Maison Ember, Seoul",
        "78.00",
        5,
        -1,
        2,
        24,
        24
)
```

- [ ] **Step 4: Apply initial reserved slots after event creation**

Inside the event loop, after creating or loading each event, set seeded inventory state only when the event has fewer reserved slots than the desired seed value:

```java
if (event.getInventory().getReservedSlots() < definition.reservedSlots()) {
    int delta = definition.reservedSlots() - event.getInventory().getReservedSlots();
    event.getInventory().reserve(delta);
}
```

Do not reduce reserved slots on existing data. This keeps the seed safer when developers rerun it.

- [ ] **Step 5: Persist one demo booking for the user**

After the event loop, persist a demo booking if the user does not already have a confirmed booking for the bookable event:

```java
if (!bookingRepository.existsByUserIdAndEventIdAndStatusIn(
        demoUser.getId(),
        DEMO_BOOKABLE_EVENT_ID,
        EnumSet.of(BookingStatus.CONFIRMED)
)) {
    persist(BookingEntity.create(
            DEMO_BOOKING_ID,
            DEMO_BOOKING_CODE,
            demoUser.getId(),
            DEMO_BOOKABLE_EVENT_ID,
            demoUser.getDisplayName(),
            2,
            new BigDecimal("45.00"),
            new BigDecimal("90.00"),
            now.minusHours(6)
    ));
}
```

- [ ] **Step 6: Add additional watchlist entries**

Keep the existing watchlist and add at least one more item:

```java
seedWatchlistIfMissing(demoUser.getId(), DEMO_BOOKABLE_EVENT_ID, "wl_demo_jazz", now);
seedWatchlistIfMissing(demoUser.getId(), DEMO_OPENING_SOON_EVENT_ID, "wl_demo_art", now.minusHours(3));
seedWatchlistIfMissing(demoUser.getId(), DEMO_ALMOST_FULL_EVENT_ID, "wl_demo_last_call", now.minusHours(2));
```

Add this helper:

```java
private void seedWatchlistIfMissing(String userId, String eventId, String watchlistId, LocalDateTime createdAt) {
    if (!watchlistRepository.existsByUserIdAndEventId(userId, eventId)) {
        persist(WatchlistEntity.create(watchlistId, userId, eventId, createdAt));
    }
}
```

- [ ] **Step 7: Run seed tests**

Run:

```powershell
cd backend
.\gradlew.bat test --tests com.reserva.backend.dev.DevDataSeederTest
```

Expected: PASS.

- [ ] **Step 8: Run booking service regression tests**

Run:

```powershell
cd backend
.\gradlew.bat test --tests com.reserva.backend.booking.BookingServiceTest
```

Expected: PASS.

- [ ] **Step 9: Commit seed changes**

```powershell
git add backend/src/main/java/com/reserva/backend/dev/DevDataSeeder.java backend/src/test/java/com/reserva/backend/dev/DevDataSeederTest.java
git commit -m "feat: enrich readme demo seed data"
```

## Task 3: Repair Visible Korean UI Copy For Screenshot Routes

**Files:**
- Modify: `frontend/components/home-page.tsx`
- Modify: `frontend/app/page.tsx`
- Modify as needed: `frontend/components/reservation-card.tsx`
- Modify as needed: `frontend/components/event-detail-client.tsx`
- Modify as needed: `frontend/components/dashboard-page.tsx`
- Modify as needed: `frontend/components/my-events-page.tsx`
- Modify as needed: `frontend/components/create-event-form.tsx`
- Modify as needed: `frontend/components/login-form.tsx`

- [ ] **Step 1: Search for mojibake in target frontend files**

Run:

```powershell
rg "�|\\?|李|湲|寃|怨|諛|?꾩|?대|?덉" frontend\components frontend\app
```

Expected: Identify corrupted Korean copy on screenshot routes.

- [ ] **Step 2: Replace `home-page.tsx` category and section labels**

Use clear Korean labels:

```ts
const categoryLabels: Record<Category, string> = {
  All: "전체",
  Concert: "콘서트",
  Restaurant: "레스토랑",
  "Art & Design": "아트 & 디자인",
  Other: "기타",
  Sports: "스포츠",
  Trending: "인기",
  "Ending Soon": "마감 임박",
  Upcoming: "오픈 예정",
  Watchlist: "찜한 이벤트",
};
```

Replace visible strings in `HomePage` with:

```tsx
<h2 className="mt-4 text-xl font-semibold text-foreground">찜한 이벤트를 보려면 로그인해 주세요</h2>
<p className="mt-2 text-sm text-muted-foreground">찜한 이벤트 목록은 로그인한 사용자만 확인할 수 있습니다.</p>
```

Use these section labels:

```ts
{ key: "trending", title: "지금 인기", items: trendingReservations },
{ key: "almost-full", title: "거의 마감", items: almostFullReservations },
{ key: "ending-soon", title: "마감 임박", items: endingSoonReservations },
```

Use these empty-state labels:

```tsx
{selectedCategory === "Watchlist" ? "아직 찜한 이벤트가 없습니다" : "이벤트를 찾을 수 없습니다"}
{selectedCategory === "Watchlist"
  ? "하트 버튼으로 저장한 이벤트가 여기에 표시됩니다."
  : "검색어나 필터 조건을 바꿔 다시 시도해 보세요."}
```

- [ ] **Step 3: Repair backend unavailable copy in `frontend/app/page.tsx`**

Replace the corrupted fallback text:

```tsx
return (
  <BackendUnavailablePage
    title="이벤트 목록을 불러올 수 없습니다"
    description="프론트엔드는 시작되었지만 이벤트 목록을 가져오기 위해 백엔드에 연결하지 못했습니다."
  />
);
```

- [ ] **Step 4: Repair other screenshot-route copy**

For each target component, replace only visible corrupted Korean strings. Keep component behavior unchanged.

Suggested Korean wording:
- Login title: `다시 만나서 반가워요`
- Signup title: `Reserva 시작하기`
- Event detail reserve button: `예약하기`
- Booking detail heading: `예약 상세`
- Dashboard heading: `대시보드`
- My events heading: `내가 만든 이벤트`
- Create event heading: `이벤트 만들기`
- Watchlist label: `찜하기`

- [ ] **Step 5: Build frontend**

Run:

```powershell
cd frontend
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit UI copy repair**

```powershell
git add frontend
git commit -m "fix: restore korean copy for demo screenshots"
```

## Task 4: Add A Local Concurrency Verification Script

**Files:**
- Create: `scripts/readme-concurrency-check.ps1`
- Create: `docs/assets/readme/.gitkeep`

- [ ] **Step 1: Create `docs/assets/readme/`**

```powershell
New-Item -ItemType Directory -Force docs\assets\readme | Out-Null
New-Item -ItemType File -Force docs\assets\readme\.gitkeep | Out-Null
```

- [ ] **Step 2: Write the PowerShell verification script**

Create `scripts/readme-concurrency-check.ps1`:

```powershell
param(
    [string]$BackendBaseUrl = "http://localhost:8080",
    [string]$EventId = "evt_demo_rooftop_last_call",
    [int]$RequestCount = 8,
    [int]$TicketCount = 2,
    [string]$OutputPath = "docs/assets/readme/concurrency-result.md"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonPost {
    param(
        [string]$Uri,
        [object]$Body,
        [hashtable]$Headers = @{}
    )

    $json = $Body | ConvertTo-Json -Depth 10
    Invoke-RestMethod -Uri $Uri -Method Post -ContentType "application/json" -Headers $Headers -Body $json
}

Write-Host "Preparing $RequestCount concurrent booking attempts for event '$EventId'."

$tokens = @()
for ($i = 1; $i -le $RequestCount; $i++) {
    $email = "perf-user-{0:D5}@example.com" -f $i
    $login = Invoke-JsonPost `
        -Uri "$BackendBaseUrl/api/v1/auth/login" `
        -Body @{ email = $email; password = "perf-password" }

    $tokens += $login.accessToken
}

$jobs = @()
for ($i = 0; $i -lt $tokens.Count; $i++) {
    $token = $tokens[$i]
    $jobs += Start-Job -ScriptBlock {
        param($BackendBaseUrl, $EventId, $TicketCount, $Token, $Index)

        try {
            $body = @{ ticketCount = $TicketCount } | ConvertTo-Json
            $response = Invoke-WebRequest `
                -Uri "$BackendBaseUrl/api/v1/events/$EventId/bookings" `
                -Method Post `
                -ContentType "application/json" `
                -Headers @{ Authorization = "Bearer $Token" } `
                -Body $body `
                -UseBasicParsing

            [pscustomobject]@{
                index = $Index
                status = [int]$response.StatusCode
                body = $response.Content
            }
        } catch {
            $status = 0
            $content = $_.Exception.Message
            if ($_.Exception.Response) {
                $status = [int]$_.Exception.Response.StatusCode
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $content = $reader.ReadToEnd()
            }

            [pscustomobject]@{
                index = $Index
                status = $status
                body = $content
            }
        }
    } -ArgumentList $BackendBaseUrl, $EventId, $TicketCount, $token, ($i + 1)
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$successCount = ($results | Where-Object { $_.status -eq 201 }).Count
$conflictCount = ($results | Where-Object { $_.status -eq 409 }).Count
$failureCount = ($results | Where-Object { $_.status -notin @(201, 409) }).Count

$markdown = @"
# Concurrent Booking Verification

Event: `$EventId`

| Metric | Value |
| --- | ---: |
| Requests | $RequestCount |
| Ticket count per request | $TicketCount |
| Created bookings (`201`) | $successCount |
| Expected conflicts (`409`) | $conflictCount |
| Unexpected failures | $failureCount |

The local check is considered valid when unexpected failures are zero and the database inventory remains within capacity after the run.
"@

New-Item -ItemType Directory -Force (Split-Path $OutputPath) | Out-Null
Set-Content -Path $OutputPath -Value $markdown -Encoding UTF8
Write-Host $markdown
```

- [ ] **Step 3: Run script help path against a non-running backend**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/readme-concurrency-check.ps1
```

Expected if backend is not running: fails clearly during login. This is acceptable before local services are started.

- [ ] **Step 4: Commit script**

```powershell
git add scripts/readme-concurrency-check.ps1 docs/assets/readme/.gitkeep
git commit -m "chore: add readme concurrency verification script"
```

## Task 5: Run The Local App With README Demo Data

**Files:**
- Read: `infra/local/compose.yml`
- Read: `backend/src/main/resources/application.yml`
- Possibly create local-only env files outside Git or document commands without committing secrets.

- [ ] **Step 1: Start MySQL and Redis**

Run:

```powershell
docker compose -f infra/local/compose.yml up -d
```

Expected: containers `reserva-local-mysql` and `reserva-local-redis` are healthy/running.

- [ ] **Step 2: Configure backend local environment**

Create or update `backend/.env` locally. Do not commit secrets.

```properties
DB_HOST=localhost
DB_PORT=3308
DB_NAME=reserva
DB_USERNAME=root
DB_PASSWORD=root
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=local-readme-demo-secret-local-readme-demo-secret
FRONTEND_ORIGIN=http://localhost:3000
SEED_DEMO_DATA=true
SEED_PERFORMANCE_DATA=true
PERF_RESET_DATA=true
PERF_EVENT_COUNT=40
PERF_USER_COUNT=20
PERF_CREATOR_COUNT=4
PERF_WATCHLISTS_PER_USER=2
```

- [ ] **Step 3: Start backend**

Run in one terminal:

```powershell
cd backend
.\run-local.ps1
```

Expected: backend starts on `http://localhost:8080`, Flyway migrations run, demo and performance seeders complete.

- [ ] **Step 4: Start frontend**

Run in another terminal:

```powershell
cd frontend
npm run dev
```

Expected: frontend starts on `http://localhost:3000`.

- [ ] **Step 5: Smoke-test login**

Open `http://localhost:3000/login`.

Login as:

```text
alex@example.com
dev-password
```

Expected: redirected into the authenticated product experience.

## Task 6: Capture README Screenshots

**Files:**
- Create PNG files under `docs/assets/readme/`

- [ ] **Step 1: Capture home discovery**

Route:

```text
http://localhost:3000/
```

Save:

```text
docs/assets/readme/home-discovery.png
```

Expected: event cards across categories, clear section headings, no corrupted text.

- [ ] **Step 2: Capture event detail**

Route:

```text
http://localhost:3000/reservation/evt_demo_jazz
```

Save:

```text
docs/assets/readme/event-detail.png
```

Expected: event hero image, title, schedule/location, remaining slots, watchlist control, reservation CTA.

- [ ] **Step 3: Capture booking confirmation or detail**

Create a new booking from the event detail page or open the seeded booking detail if the UI exposes it.

Save:

```text
docs/assets/readme/booking-detail.png
```

Expected: booking code, ticket count, total amount, event snapshot.

- [ ] **Step 4: Capture dashboard**

Route:

```text
http://localhost:3000/dashboard
```

Save:

```text
docs/assets/readme/dashboard.png
```

Expected: non-empty recent booking, watchlist, and opening-soon sections.

- [ ] **Step 5: Capture host event management**

Log out and log in as:

```text
creator@example.com
dev-password
```

Route:

```text
http://localhost:3000/my-events
```

Save:

```text
docs/assets/readme/host-events.png
```

Expected: host-owned events list is non-empty.

- [ ] **Step 6: Capture create event form**

Route:

```text
http://localhost:3000/create
```

Save:

```text
docs/assets/readme/create-event.png
```

Expected: complete event creation form with readable labels.

- [ ] **Step 7: Generate concurrency result evidence**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/readme-concurrency-check.ps1 -EventId evt_demo_rooftop_last_call -RequestCount 8 -TicketCount 2
```

Expected: creates `docs/assets/readme/concurrency-result.md`.

- [ ] **Step 8: Commit screenshots and evidence**

```powershell
git add docs/assets/readme
git commit -m "docs: add readme product screenshots"
```

## Task 7: Rewrite README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` content with product-demo portfolio structure**

Use this structure and adapt wording only where the screenshots reveal a better product story:

```markdown
# Reserva

Reserva는 이벤트 탐색, 찜, 예약, 주최자 이벤트 관리를 제공하는 로컬 재현형 이벤트 예약 플랫폼입니다.

사용자는 관심 있는 이벤트를 찾고 예약할 수 있고, 주최자는 이벤트를 만들고 예약 현황을 관리할 수 있습니다. 이 프로젝트는 단순 CRUD보다 예약 재고 정합성과 동시 요청 제어를 중심으로 설계했습니다.

## 데모 화면

> 아래 화면은 `SEED_DEMO_DATA=true`로 로컬에서 생성한 더미데이터를 기준으로 캡처했습니다.

![홈 탐색](./docs/assets/readme/home-discovery.png)

| 이벤트 상세 | 예약 상세 |
| --- | --- |
| ![이벤트 상세](./docs/assets/readme/event-detail.png) | ![예약 상세](./docs/assets/readme/booking-detail.png) |

| 대시보드 | 주최자 이벤트 관리 |
| --- | --- |
| ![대시보드](./docs/assets/readme/dashboard.png) | ![주최자 이벤트 관리](./docs/assets/readme/host-events.png) |

![이벤트 생성](./docs/assets/readme/create-event.png)

## 주요 기능

### 사용자
- 이벤트 목록 탐색
- 검색, 카테고리 필터, 섹션별 탐색
- 이벤트 상세 조회
- 이벤트 예약 및 예약 취소
- 찜 추가/해제
- 내 예약과 대시보드 확인

### 주최자
- 이벤트 생성
- 내가 만든 이벤트 목록 조회
- 예약이 없는 이벤트 수정/삭제

### 인증
- 이메일/비밀번호 회원가입 및 로그인
- JWT 기반 보호 API 접근
- 프론트엔드 route handler에서 httpOnly 쿠키를 관리하고 백엔드에는 Bearer 토큰으로 전달

## 기술 스택

| 영역 | 기술 | 사용 이유 |
| --- | --- | --- |
| Frontend | Next.js App Router, React, TypeScript | 서버 컴포넌트와 route handler를 활용해 화면 렌더링과 인증 경계를 분리 |
| Styling | Tailwind CSS | 빠르게 일관된 UI를 구성하고 반응형 화면을 관리 |
| Backend | Spring Boot, Spring Security | 인증, 인가, 예약 API를 명확한 계층으로 구현 |
| Persistence | Spring Data JPA, QueryDSL, Flyway | 도메인 저장, 동적 조회 조건, 스키마 버전 관리를 분리 |
| Data | MySQL, Redis | 예약/이벤트 데이터는 MySQL에 저장하고 예약 admission lock은 Redis로 처리 |
| Local Infra | Docker Compose | MySQL과 Redis를 로컬에서 재현 가능하게 실행 |

## 핵심 기술 포인트: 동시성 예약 제어

예약 서비스에서는 같은 이벤트에 여러 사용자가 동시에 접근할 수 있습니다. 단순히 남은 좌석 수만 확인하고 예약을 생성하면 좌석 초과 예약이나 중복 예약이 발생할 수 있습니다.

Reserva는 예약 생성 시 이벤트 단위 Redis admission lock을 먼저 획득하고, 이후 DB 트랜잭션 안에서 예약 가능 시간, 남은 좌석, 중복 예약 여부를 다시 검증합니다. 재고는 `event_inventory`를 기준으로 갱신하며, Redis가 사용할 수 없는 경우 예약을 닫힌 상태로 실패시켜 정합성을 우선합니다.

```text
동시 요청 -> Redis event lock -> DB 트랜잭션 -> 재고 검증/차감 -> 예약 생성
```

로컬 검증 결과:

<!-- concurrency-result.md 내용을 짧게 표로 옮기거나 링크합니다. -->

## 로컬 실행

### 1. MySQL과 Redis 실행

```powershell
docker compose -f infra/local/compose.yml up -d
```

### 2. 백엔드 실행

`backend/.env` 예시:

```properties
DB_HOST=localhost
DB_PORT=3308
DB_NAME=reserva
DB_USERNAME=root
DB_PASSWORD=root
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=local-readme-demo-secret-local-readme-demo-secret
FRONTEND_ORIGIN=http://localhost:3000
SEED_DEMO_DATA=true
```

```powershell
cd backend
.\run-local.ps1
```

### 3. 프론트엔드 실행

```powershell
cd frontend
npm install
npm run dev
```

## 데모 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 사용자 | `alex@example.com` | `dev-password` |
| 주최자 | `creator@example.com` | `dev-password` |

## 프로젝트 구조

```text
reserva/
├─ frontend/    # Next.js App Router 기반 웹 앱
├─ backend/     # Spring Boot API, 인증, 예약, 이벤트 도메인
├─ infra/       # 로컬/배포 Docker Compose 및 Nginx 설정
├─ docs/        # 설계, 운영, README 이미지 문서
└─ perf/        # k6 기반 성능 테스트 스크립트
```

## 추가 문서

- [API 명세](./docs/ko/api-spec.md)
- [DB 설계](./docs/ko/db.md)
- [아키텍처](./docs/engineering/architecture.md)
```

- [ ] **Step 2: Insert the concurrency result table**

Open `docs/assets/readme/concurrency-result.md`, copy its concise table into README, and remove this line:

```markdown
<!-- concurrency-result.md 내용을 짧게 표로 옮기거나 링크합니다. -->
```

- [ ] **Step 3: Verify README links**

Run:

```powershell
rg "reserva-frontend|vercel|p95|performance improvement|성능 개선" README.md
```

Expected: no matches for deployed URL or performance-improvement narrative. A match for `perf/` in project structure is acceptable only if it does not present performance as the README story.

- [ ] **Step 4: Commit README**

```powershell
git add README.md
git commit -m "docs: rewrite readme as product demo portfolio"
```

## Task 8: Final Verification

**Files:**
- Verify: `README.md`
- Verify: `docs/assets/readme/*`
- Verify: `backend/src/main/java/com/reserva/backend/dev/DevDataSeeder.java`
- Verify: `frontend/components/*`

- [ ] **Step 1: Run backend tests**

```powershell
cd backend
.\gradlew.bat test
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

```powershell
cd frontend
npm run build
```

Expected: PASS.

- [ ] **Step 3: Verify README screenshot files exist**

```powershell
Get-ChildItem docs\assets\readme
```

Expected files:

```text
home-discovery.png
event-detail.png
booking-detail.png
dashboard.png
host-events.png
create-event.png
concurrency-result.md
```

- [ ] **Step 4: Verify README no longer centers deployment/performance**

```powershell
rg "https://reserva|vercel|p95|k6|성능 개선|performance" README.md
```

Expected: no deployed URL, no p95 table, no performance-improvement section. If `k6` or `perf/` appears only in project structure or supporting docs links, keep it minimal.

- [ ] **Step 5: Commit final polish if needed**

If verification required fixes:

```powershell
git add README.md docs/assets/readme backend frontend scripts
git commit -m "chore: polish readme demo package"
```

If no fixes were required, do not create an empty commit.

## Self-Review

Spec coverage:
- README product-demo focus is covered by Tasks 6 and 7.
- Seed data improvement is covered by Tasks 1 and 2.
- Screenshot capture is covered by Task 6.
- Concurrency-only backend highlight is covered by Tasks 4 and 7.
- Local execution and demo accounts are covered by Tasks 5 and 7.
- Performance narrative removal is verified in Tasks 7 and 8.

Completeness scan:
- The README draft contains a temporary concurrency-result comment, and Task 7 Step 2 removes it before committing README.md.
- Each task gives concrete files, commands, and expected results.

Type consistency:
- `DevDataSeeder` constructor changes are reflected in the new test.
- Demo account emails and password match the existing seed convention.
- Script uses backend auth and booking endpoints already present in the project.
