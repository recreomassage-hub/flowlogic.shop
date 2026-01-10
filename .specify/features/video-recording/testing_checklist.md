# Video Recording - Testing Checklist

**Дата создания:** 2026-01-06  
**Статус:** Готово к тестированию

---

## HAPPY PATH TESTING

### Test 1: Complete Recording Flow
- [ ] Navigate to `/assessments/new` from dashboard
- [ ] Camera permission requested automatically
- [ ] Camera preview shows after permission granted
- [ ] Click "Start Recording" button
- [ ] Recording starts within 1 second
- [ ] Timer displays and updates every second (MM:SS format)
- [ ] Live preview shows during recording
- [ ] Click "Stop Recording" button
- [ ] Recording stops immediately
- [ ] Video preview shows with recorded video
- [ ] Duration and file size displayed correctly
- [ ] Click "Upload Video" button
- [ ] Upload progress shows (0-100%)
- [ ] Success message appears
- [ ] Redirects to assessment detail page after 1.5 seconds

**Expected Result:** ✅ Complete flow works without errors

---

### Test 2: Auto-Stop at 45 Seconds
- [ ] Start recording
- [ ] Let recording continue to 45 seconds
- [ ] Recording stops automatically at 45 seconds
- [ ] Timer shows red background at 45 seconds
- [ ] Video preview shows after auto-stop

**Expected Result:** ✅ Recording stops at exactly 45 seconds

---

### Test 3: Video Validation (Valid Video)
- [ ] Record video (5-45 seconds, < 50MB)
- [ ] Stop recording
- [ ] Check validation passes (no errors shown)
- [ ] Upload button is enabled
- [ ] Upload succeeds

**Expected Result:** ✅ Valid video uploads successfully

---

## ERROR SCENARIO TESTING

### Test 4: Camera Permission Denied
- [ ] Deny camera permission when prompted
- [ ] Error message shows: "Camera permission denied..."
- [ ] Instructions with browser help links displayed
- [ ] "Retry" button available
- [ ] Click "Retry" → permission requested again
- [ ] Grant permission → camera works

**Expected Result:** ✅ Clear error message with instructions

---

### Test 5: Camera Not Available
- [ ] Use device without camera (or disable in browser)
- [ ] Error message shows: "Camera not available..."
- [ ] No retry option (feature required)

**Expected Result:** ✅ Clear error message

---

### Test 6: Video Too Long (> 45 seconds)
- [ ] Record video longer than 45 seconds (if possible)
- [ ] Auto-stop at 45 seconds
- [ ] If manually stopped after 45s, validation should fail
- [ ] Error: "Video too long. Maximum duration is 45 seconds."
- [ ] Upload button disabled

**Expected Result:** ✅ Validation blocks upload

---

### Test 7: Video Too Large (> 50MB)
- [ ] Record very long/high quality video (> 50MB)
- [ ] Stop recording
- [ ] Validation error: "Video too large..."
- [ ] Upload button disabled

**Expected Result:** ✅ Validation blocks upload

---

### Test 8: Network Error During Upload
- [ ] Record and stop video
- [ ] Disconnect network
- [ ] Click "Upload Video"
- [ ] Error: "Network error during upload"
- [ ] Retry button available (if retryCount < 3)
- [ ] Reconnect network
- [ ] Click "Retry"
- [ ] Upload succeeds

**Expected Result:** ✅ Retry works after network recovery

---

### Test 9: Upload Timeout
- [ ] Record video
- [ ] Simulate slow network (throttle in DevTools)
- [ ] Start upload
- [ ] Wait > 60 seconds
- [ ] Timeout error shows
- [ ] Retry available

**Expected Result:** ✅ Timeout handled correctly

---

### Test 10: Max Retries Reached
- [ ] Record video
- [ ] Disconnect network
- [ ] Attempt upload (fails)
- [ ] Retry 3 times
- [ ] After 3rd failure: "Upload failed after 3 attempts..."
- [ ] No retry button shown
- [ ] User must record again

**Expected Result:** ✅ Max retries enforced

---

## RETRY FUNCTIONALITY TESTING

### Test 11: Retry Recording
- [ ] Record video
- [ ] Stop recording
- [ ] Click "Retry" button
- [ ] Video preview disappears
- [ ] Camera preview shows again
- [ ] Can start new recording
- [ ] Previous video discarded

**Expected Result:** ✅ Retry clears previous recording

---

### Test 12: Retry Upload
- [ ] Record video
- [ ] Upload fails (network error)
- [ ] Click "Retry" button
- [ ] Upload attempts again
- [ ] Progress tracking works
- [ ] Upload succeeds on retry

**Expected Result:** ✅ Retry upload works

---

## BROWSER COMPATIBILITY TESTING

### Test 13: Chrome (Desktop)
- [ ] Complete recording flow
- [ ] Video format: WebM
- [ ] All features work

**Expected Result:** ✅ Full functionality

---

### Test 14: Firefox (Desktop)
- [ ] Complete recording flow
- [ ] Video format: WebM
- [ ] All features work

**Expected Result:** ✅ Full functionality

---

### Test 15: Safari (Desktop)
- [ ] Complete recording flow
- [ ] Video format: MP4 (fallback)
- [ ] All features work

**Expected Result:** ✅ Full functionality with MP4

---

### Test 16: Chrome Mobile (Android)
- [ ] Complete recording flow
- [ ] Touch controls work
- [ ] Responsive layout
- [ ] Camera access works

**Expected Result:** ✅ Mobile-friendly

---

### Test 17: Safari Mobile (iOS)
- [ ] Complete recording flow
- [ ] Touch controls work
- [ ] Responsive layout
- [ ] Camera access works
- [ ] Video format: MP4

**Expected Result:** ✅ Mobile-friendly

---

## ACCESSIBILITY TESTING

### Test 18: Keyboard Navigation
- [ ] Tab through all buttons
- [ ] Enter/Space activates buttons
- [ ] Focus visible on all buttons
- [ ] Can complete full flow with keyboard only

**Expected Result:** ✅ Keyboard accessible

---

### Test 19: Screen Reader
- [ ] Use NVDA/JAWS/VoiceOver
- [ ] All buttons announced correctly
- [ ] Status updates announced
- [ ] Error messages announced
- [ ] Video elements described

**Expected Result:** ✅ Screen reader friendly

---

## EDGE CASES TESTING

### Test 20: Browser Close During Recording
- [ ] Start recording
- [ ] Try to close tab
- [ ] Warning dialog appears
- [ ] Cancel → recording continues
- [ ] Close anyway → recording lost (expected)

**Expected Result:** ✅ Warning shown

---

### Test 21: Browser Close During Upload
- [ ] Start upload
- [ ] Try to close tab
- [ ] Warning dialog appears
- [ ] Cancel → upload continues
- [ ] Close anyway → upload interrupted

**Expected Result:** ✅ Warning shown

---

### Test 22: Multiple Recordings Before Upload
- [ ] Record video 1
- [ ] Stop recording
- [ ] Click "Retry"
- [ ] Record video 2
- [ ] Stop recording
- [ ] Upload video 2
- [ ] Video 1 discarded (expected)

**Expected Result:** ✅ Only last recording kept

---

### Test 23: Presigned URL Expired
- [ ] Create assessment
- [ ] Wait > 15 minutes (URL expires)
- [ ] Record video
- [ ] Try to upload
- [ ] Error: "Upload failed with status 403" (or similar)
- [ ] User must create new assessment

**Expected Result:** ✅ Expired URL handled

---

### Test 24: Low Motion Detection (Optional)
- [ ] Record video with minimal movement
- [ ] Stop recording
- [ ] Warning shown (if implemented)
- [ ] Can still upload (validation doesn't block)

**Expected Result:** ✅ Warning shown, upload allowed

---

## PERFORMANCE TESTING

### Test 25: Recording Start Time
- [ ] Click "Start Recording"
- [ ] Measure time to recording start
- [ ] Should be < 1 second

**Expected Result:** ✅ Fast start

---

### Test 26: Upload Speed
- [ ] Record 45-second video
- [ ] Start upload
- [ ] Measure upload time
- [ ] Should complete in reasonable time (depends on network)

**Expected Result:** ✅ Acceptable upload speed

---

### Test 27: Memory Usage
- [ ] Record multiple videos
- [ ] Upload videos
- [ ] Navigate away
- [ ] Check browser memory (DevTools)
- [ ] No memory leaks

**Expected Result:** ✅ No memory leaks

---

## MOBILE SPECIFIC TESTING

### Test 28: Portrait Orientation
- [ ] Open on mobile in portrait
- [ ] All UI elements visible
- [ ] Buttons accessible
- [ ] Video preview fits screen

**Expected Result:** ✅ Portrait works

---

### Test 29: Landscape Orientation
- [ ] Rotate to landscape
- [ ] UI adapts correctly
- [ ] Video preview fits screen
- [ ] All features work

**Expected Result:** ✅ Landscape works

---

### Test 30: Touch Targets
- [ ] All buttons large enough (≥ 44px)
- [ ] Easy to tap on mobile
- [ ] No accidental clicks

**Expected Result:** ✅ Touch-friendly

---

## INTEGRATION TESTING

### Test 31: Assessment Creation Flow
- [ ] Go to Assessments page
- [ ] Click "Start New Assessment"
- [ ] Assessment created in backend
- [ ] Redirected to `/assessments/new`
- [ ] `assessmentId` and `uploadUrl` passed correctly
- [ ] Recording works

**Expected Result:** ✅ Integration works

---

### Test 32: Navigation After Upload
- [ ] Complete upload
- [ ] Success message shows
- [ ] Redirects to `/assessments/{id}`
- [ ] Assessment detail page loads
- [ ] Video URL saved in assessment

**Expected Result:** ✅ Navigation works

---

## SUMMARY

**Total Test Cases:** 32

**Critical Tests (Must Pass):**
- Test 1: Complete Recording Flow
- Test 2: Auto-Stop at 45 Seconds
- Test 4: Camera Permission Denied
- Test 6: Video Too Long
- Test 7: Video Too Large
- Test 8: Network Error During Upload
- Test 13-17: Browser Compatibility

**Recommended Tests:**
- All other tests for comprehensive coverage

---

## KNOWN ISSUES / LIMITATIONS

1. **Console Errors:** `console.error` used for debugging (acceptable for development)
2. **Motion Detection:** Basic implementation (optional, P2)
3. **Browser Support:** Requires modern browser with MediaRecorder API
4. **iOS Limitations:** May have restrictions on video recording

---

## TESTING ENVIRONMENT

**Recommended:**
- Chrome DevTools for network throttling
- Browser DevTools for console errors
- Real mobile devices for mobile testing
- Screen reader software for accessibility

---

**Следующий шаг:** Выполнить manual testing по чеклисту выше



