@echo off
echo ========================================
echo Starting OKGYM Application
echo ========================================

:: Use full path to Node.js in Miniconda environment
set NODE_EXE=C:\Users\DELL\miniconda3\envs\kaiqi\node.exe

echo Starting backend server...
start cmd /k "cd backend && "%NODE_EXE%" node_modules\ts-node\dist\bin.js src\app.ts"

echo Starting frontend server...
start cmd /k "cd frontend && "%NODE_EXE%" node_modules\react-scripts\bin\react-scripts.js start"

echo.
echo Both servers should now be starting...
echo.
echo Backend server: http://localhost:3001
echo Frontend application: http://localhost:3000
echo.
echo 1. You can now access the application at http://localhost:3000
echo 2. Login to access the dashboard
echo 3. Test functionality such as viewing and creating workout plans
echo.
:: Wait for 3 seconds to show the message, then exit
echo This window will close automatically. The servers will continue running in their own windows.
exit 
