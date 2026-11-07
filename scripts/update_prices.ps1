# Fetch real tomato prices on this PC and publish them.
# data.gov.in refuses connections from outside India, so GitHub's servers cannot
# fetch prices themselves. Run this from a PC in India instead:
#   powershell -ExecutionPolicy Bypass -File scripts\update_prices.ps1
# It reads DATA_GOV_API_KEY from a .env file in the project folder. That file is
# never committed. Pushing the new data makes Vercel redeploy the site.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
# Keep a record of each run, since the scheduled task runs with no window.
Start-Transcript -Path (Join-Path (Get-Location) 'update-prices.log') -Append | Out-Null

function Invoke-Step($label, [scriptblock]$command) {
    Write-Host "== $label"
    & $command
    if ($LASTEXITCODE -ne 0) { throw "$label failed" }
}

if (-not (Test-Path .venv)) {
    Invoke-Step 'Setting up Python' { python -m venv .venv }
    Invoke-Step 'Installing packages' { .\.venv\Scripts\python -m pip install -q -r scripts\requirements.txt }
}

Invoke-Step 'Getting latest code' { git pull -q --rebase }
Invoke-Step 'Fetching prices' { .\.venv\Scripts\python scripts\fetch_prices.py }
Invoke-Step 'Updating forecast' { .\.venv\Scripts\python scripts\predict.py }

git add public/data
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host 'No price changes to publish.'
    exit 0
}
Invoke-Step 'Saving' { git commit -q -m 'Update tomato prices' }
Invoke-Step 'Publishing' { git push -q }
Write-Host 'Done. Vercel will redeploy the site in about a minute.'
