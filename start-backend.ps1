param([string]$ProjectRoot)
Set-Location $ProjectRoot\backend
& "$ProjectRoot\backend\venv\Scripts\Activate.ps1"
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload 2>&1
