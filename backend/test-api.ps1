# Script to test API endpoints for the relationship system
$baseUrl = "http://localhost:3001/api"

Write-Host "Testing Relationship API Endpoints..." -ForegroundColor Green
Write-Host "Note: Make sure the server is running with the correct Node.js path:" -ForegroundColor Yellow
Write-Host "C:\Users\DELL\miniconda3\envs\kaiqi\node.exe" -ForegroundColor Yellow
Write-Host ""

# Test endpoints
try {
    # Test relationship endpoints
    Write-Host "Testing relationship endpoint..." -ForegroundColor Cyan
    $relationshipTest = Invoke-RestMethod -Uri "$baseUrl/test/relationships" -Method GET
    Write-Host "  Success! Found categories count: $($relationshipTest.categoriesCount)" -ForegroundColor Green
    
    # Test workout-relationships endpoint
    Write-Host "Testing workout relationship endpoint..." -ForegroundColor Cyan
    $workoutTest = Invoke-RestMethod -Uri "$baseUrl/test/workout-relationships" -Method GET
    Write-Host "  Success! Found muscle groups count: $($workoutTest.muscleGroups.Count)" -ForegroundColor Green
    
    Write-Host "All tests passed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error testing API: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} 