@echo off
echo ===================================================
echo Setting up Laboratory Management System (Local Lab)
echo ===================================================

if not exist ..\.env (
    echo Creating .env from template...
    copy ..\env\.env.local.example ..\.env
    echo Please review ..\.env before starting!
)

echo Starting Docker containers...
cd ..
docker compose up -d --build

echo.
echo Application started! Open http://localhost in your browser.
pause
