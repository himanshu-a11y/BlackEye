# BLACK EYE - Start Backend
Set-Location "$PSScriptRoot\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
