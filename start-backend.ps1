param([string]$ProjectRoot)
Set-Location $ProjectRoot\backend
& "$ProjectRoot\backend\venv\Scripts\Activate.ps1"
uvicorn app.main:app --reload --port 8001 --host 0.0.0.0
