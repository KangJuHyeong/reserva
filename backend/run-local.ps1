$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.Trim().StartsWith("#")) {
            $pair = $_ -split "=", 2
            if ($pair.Length -eq 2) {
                $key = $pair[0].Trim()
                $value = $pair[1].Trim()
                [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
    }
}

Push-Location $PSScriptRoot
try {
    & (Join-Path $PSScriptRoot "gradlew.bat") bootRun
} finally {
    Pop-Location
}
