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

$results = @($jobs | Wait-Job | Receive-Job)
$jobs | Remove-Job

$successCount = @($results | Where-Object { $_.status -eq 201 }).Count
$conflictCount = @($results | Where-Object { $_.status -eq 409 }).Count
$failureCount = @($results | Where-Object { $_.status -notin @(201, 409) }).Count

$markdown = @"
# Concurrent Booking Verification

Event: ``$EventId``

| Metric | Value |
| --- | ---: |
| Requests | $RequestCount |
| Ticket count per request | $TicketCount |
| Created bookings (201) | $successCount |
| Expected conflicts (409) | $conflictCount |
| Unexpected failures | $failureCount |

This local check is valid when unexpected failures are zero and database inventory remains within capacity after the run.
"@

New-Item -ItemType Directory -Force (Split-Path $OutputPath) | Out-Null
Set-Content -Path $OutputPath -Value $markdown -Encoding UTF8
Write-Host $markdown
