# Relationship Fix Test Script
Write-Host "Testing relationship loader fix implementation..." -ForegroundColor Green

# Set the full path to Node.js executable (same as in start-okgym.bat)
$NODE_EXE = "C:\Users\DELL\miniconda3\envs\kaiqi\node.exe"
Write-Host "Using Node.js at: $NODE_EXE" -ForegroundColor Cyan

# Step 1: Compile the TypeScript code
Write-Host "Compiling TypeScript code..." -ForegroundColor Cyan
# Instead of using tsc directly, use npm run build which should be configured correctly
npm run build

# Step 2: Start the server in a new PowerShell window
Write-Host "Starting the server..." -ForegroundColor Cyan
# Use ts-node directly with the correct path
$serverProcess = Start-Process powershell -PassThru -ArgumentList "-Command", "cd $PSScriptRoot; & '$NODE_EXE' './node_modules/ts-node/dist/bin.js' src/app.ts; Read-Host 'Press Enter to exit'"

# Give the server time to start
Write-Host "Waiting for server to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 3: Run the test script
Write-Host "Testing API endpoints..." -ForegroundColor Cyan
try {
    # Run our test script
    & "$PSScriptRoot\test-api.ps1"
    
    Write-Host "`nRelationship fix verification completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error during testing: $_" -ForegroundColor Red
} finally {
    # Ask user if they want to stop the server
    $stopServer = Read-Host "Do you want to stop the server? (y/n)"
    if ($stopServer -eq "y") {
        # Step 4: Stop the server
        Write-Host "Stopping server..." -ForegroundColor Cyan
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "Server stopped." -ForegroundColor Green
    } else {
        Write-Host "Server left running. Remember to close it manually when done." -ForegroundColor Yellow
    }
} 