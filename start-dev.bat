@echo off
set PROJECT_ROOT=C:\nnn\orange-app\
wt new-tab --title "Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npx expo start" ; new-tab --title "Backend" powershell -NoExit -ExecutionPolicy Bypass -File "%PROJECT_ROOT%start-backend.ps1" -ProjectRoot "%PROJECT_ROOT:~0,-1%"
