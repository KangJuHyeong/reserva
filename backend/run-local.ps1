$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.Trim().StartsWith("#")) {
            $pair = $_ -split "=", 2
            if ($pair.Length -eq 2) {
                [System.Environment]::SetEnvironmentVariable($pair[0], $pair[1], "Process")
            }
        }
    }
}

& (Join-Path $PSScriptRoot "gradlew.bat") bootRun
