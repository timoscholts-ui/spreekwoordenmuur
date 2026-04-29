@echo off
setlocal EnableDelayedExpansion

:: Resolve project root (parent of scripts/)
set "PROJECT_DIR=%~dp0.."
pushd "%PROJECT_DIR%"
set "PROJECT_DIR=%CD%"
popd

set "VENV_ACTIVATE=%PROJECT_DIR%\.venv\Scripts\activate.bat"
set "SCRIPTS_DIR=%PROJECT_DIR%\scripts"
set "CLAUDE_PATH=C:\Users\Timo\AppData\Roaming\npm\claude.cmd"

echo [%date% %time%] === Spreekwoordenmuur publish run ===

if not exist "%VENV_ACTIVATE%" (
    echo [%date% %time%] ERROR: venv not found at %VENV_ACTIVATE%
    exit /b 2
)

call "%VENV_ACTIVATE%"

cd /d "%SCRIPTS_DIR%"
set "CLAUDE_PATH=%CLAUDE_PATH%"
python -X utf8 generate_daily_saying.py >> "%PROJECT_DIR%\logs\git_publish.log" 2>&1
set "GEN_EXIT=%errorlevel%"

if %GEN_EXIT% == 1 (
    echo [%date% %time%] No new saying produced. Skipping git push.
    exit /b 1
)

if %GEN_EXIT% neq 0 (
    echo [%date% %time%] ERROR: Generator failed with exit code %GEN_EXIT%. Check logs\git_publish.log
    exit /b 2
)

cd /d "%PROJECT_DIR%"
git add src\data\sayings.json src\data\index.json
git commit -m "data: daily saying %date%"
git push

if %errorlevel% neq 0 (
    echo [%date% %time%] ERROR: git push failed.
    exit /b 2
)

echo [%date% %time%] Published successfully.
exit /b 0
