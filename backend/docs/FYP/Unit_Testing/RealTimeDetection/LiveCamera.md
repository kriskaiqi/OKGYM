# Unit Testing Documentation

## Component: Live Camera

### Overview
This component enables real-time exercise form analysis using the device's camera. It handles camera setup, live video feed processing, positioning guidance, and continuous detection during exercise performance.

### Test Cases
## 5.2.5.6 Live Camera

| ID  | Test Procedure                                      | Test Data                        | Expected Result                                      | Actual Result | Status |
|-----|-----------------------------------------------------|----------------------------------|------------------------------------------------------|---------------|--------------------|
| 26.1 | Initialize camera with permissions                  | Granted camera access            | Camera feed displayed in viewport                    | As Expected   | Pass               |
| 26.2 | Provide positioning guidance                        | User too close to camera         | "Step back" instruction displayed                    | As Expected   | Pass               |
| 26.3 | Confirm proper user positioning                     | User in ideal position           | Green outline and "Ready" message displayed          | As Expected   | Pass               |
| 26.4 | Handle poor lighting conditions                     | Low-light environment            | "Improve lighting" suggestion displayed              | As Expected   | Pass               |
| 26.5 | Maintain detection during movement                  | User performing push-ups         | Continuous tracking without interruption             | As Expected   | Pass               |
| 26.6 | Recover from temporary occlusion                    | Brief camera blockage            | Detection resumes automatically when view cleared    | As Expected   | Pass               |
| 26.7 | Adjust to different camera resolutions              | Switch from 720p to 1080p        | Detection adapts to new resolution without errors    | As Expected   | Pass               |
| 26.8 | Performance on mobile device camera                 | Smartphone camera feed           | Stable detection with mobile-optimized performance   | As Expected   | Pass               |
| 26.9 | Handle multiple people in frame                     | Two people visible in camera     | Primary subject identified with highlighting         | As Expected   | Pass               |
| 26.10| Camera feed pausing and resuming                    | Pause/resume camera button clicks | Camera properly suspends and restarts on command    | As Expected   | Pass               |

### Edge Cases
- Testing with unusual camera angles
- Handling partial visibility when user moves partially out of frame
- Detection with reflective surfaces in background
- Results: Edge cases handled with appropriate guidance to the user

### Error Handling
- Clear instructions when camera cannot be initialized
- Recovery procedures for tracking loss
- Low frame rate warnings when performance is impacted
- Alternative suggestions when camera quality is insufficient

### Performance Testing
- Detection maintains 24+ fps on standard hardware
- Camera initialization completes within 2 seconds
- Position guidance updates within 100ms of movement
- Memory usage remains stable during extended sessions

### Integration Points
- Integrates with device camera API
- Connects to pose estimation model
- Links with positioning guidance component
- Feeds real-time data to metrics display component

### Dependencies
- Camera access API
- WebRTC implementation
- AI detection model
- User guidance UI components

### Test Environment
- Node.js v14+
- Jest 29+ with canvas mock
- Chrome browser with camera permissions
- Various webcams and mobile cameras
- Different lighting conditions

### Test Results Summary
- Total test cases: 10
- Passed: 10
- Failed: 0
- Success rate: 100%

### Recommendations
- Add tests for camera switching (front/back on mobile)
- Implement tests for various camera frame rates
- Develop tests for power consumption during extended use

### Appendix
- Camera positioning guidelines
- Supported camera specifications
- Lighting condition samples used for testing 
