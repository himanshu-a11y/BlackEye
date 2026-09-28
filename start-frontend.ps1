# BLACK EYE - Start Frontend
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
	throw "npm was not found in PATH. Install Node.js or update PATH before starting the frontend."
}

Write-Host "Starting BLACK EYE Frontend on http://localhost:5173" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run dev
