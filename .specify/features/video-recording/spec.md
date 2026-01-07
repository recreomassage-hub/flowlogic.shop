# Video Recording for Assessments - Specification

**Тип:** Новая фича  
**Дата создания:** 2026-01-06  
**Статус:** В разработке  
**Приоритет:** P0 (Critical для MVP)

---

## OVERVIEW

Пользователи могут записывать видео напрямую в браузере для прохождения assessment тестов. Видео записывается через WebRTC API, валидируется на клиенте, и загружается в S3 через presigned URL, полученный от backend.

---

## REQUIREMENTS

### 1. Video Recording Functionality

#### 1.1. Recording Interface
- **Location:** `AssessmentNewPage.tsx` (уже создана страница)
- **Trigger:** Пользователь нажимает "Start Recording" после создания assessment
- **Camera Access:** Запрос разрешения на доступ к камере через `getUserMedia({ video: true })` (только видео, без аудио)
- **Video Preview:** Показывать live preview камеры перед и во время записи
- **Recording Controls:**
  - Start Recording button
  - Stop Recording button
  - Retry button (после остановки, до загрузки)
  - Cancel button (отмена записи, возврат к списку assessments)

#### 1.2. Recording Constraints
- **Max Duration:** 45 seconds (hard limit, согласно PRD 4.3.7.1)
- **Min Duration:** 5 seconds (soft limit, предупреждение если меньше)
- **Video Format:** 
  - Primary: WebM (VP8/VP9 codec)
  - Fallback: MP4 (H.264) для Safari/iOS
- **Resolution:** 
  - Preferred: 1280x720 (720p)
  - Minimum: 640x480 (480p)
  - Maximum: 1920x1080 (1080p)
- **Frame Rate:** 30 fps (preferred), 24 fps (minimum)
- **Aspect Ratio:** 16:9 (preferred), 4:3 (fallback)

#### 1.3. Recording States
- **Initial:** Показывать инструкции и кнопку "Start Recording"
- **Requesting Permission:** Показывать "Requesting camera access..."
- **Ready:** Показывать live preview и кнопку "Start Recording"
- **Recording:** Показывать live preview, таймер, кнопку "Stop Recording"
- **Stopped:** Показывать preview записанного видео (обязательно), кнопки "Retry" и "Upload"
- **Uploading:** Показывать progress bar и процент загрузки
- **Success:** Показывать success message и кнопку "Continue to Results"
- **Error:** Показывать error message и кнопку "Retry"

### 2. Client-Side Validation

#### 2.1. Pre-Upload Validation
Перед загрузкой видео в S3, клиент должен проверить:

- **Duration Check:**
  - ✅ Duration ≤ 45 seconds (согласно PRD 4.3.7.1)
  - ⚠️ Duration < 5 seconds → предупреждение, но разрешить загрузку
  - ❌ Duration > 45 seconds → блокировать, показать ошибку "Video too long. Maximum duration is 45 seconds."

- **File Size Check:**
  - ✅ Size ≤ 50MB
  - ❌ Size > 50MB → блокировать, показать ошибку "Video too large. Please record a shorter video."

- **Motion Detection (optional, MVP):**
  - ⚠️ Если motion variance < threshold → предупреждение "Low motion detected"
  - Не блокировать загрузку (валидация на backend)

- **Format Check:**
  - ✅ WebM или MP4
  - ❌ Другой формат → конвертировать или показать ошибку

- **Compression Check:**
  - ✅ Видео должно быть сжато через MediaRecorder settings (bitrate ~2-3 Mbps для 720p)
  - ✅ Разрешение максимум 720p (1280x720)
  - ⚠️ Если размер все еще > 50MB после компрессии → показать ошибку

#### 2.2. Camera Permission Handling
- **Granted:** Продолжить с записью
- **Denied:** Показать инструкции как разрешить доступ в настройках браузера
- **Not Available:** Показать ошибку "Camera not available" и предложить использовать другое устройство

### 3. Video Upload

#### 3.1. Upload Process
- **Presigned URL:** Использовать `uploadUrl` из `location.state` (получен при создании assessment)
- **Method:** PUT request к S3 presigned URL
- **Headers:**
  - `Content-Type: video/webm` или `video/mp4`
  - `Content-Length: {file.size}`
- **Progress Tracking:** Показывать progress bar с процентами
- **Timeout:** 60 seconds для загрузки

#### 3.2. Upload States
- **Preparing:** Показывать "Preparing video for upload..."
- **Uploading:** Показывать progress bar (0-100%)
- **Success:** Показывать "Video uploaded successfully!"
- **Error:** Показывать error message и кнопку "Retry Upload"

#### 3.3. Error Handling
- **Network Error:** Показать "Network error. Please check your connection and try again." (retry до 3 попыток)
- **S3 Upload Error:** Показать "Upload failed. Please try again." (retry до 3 попыток)
- **Timeout:** Показать "Upload timeout. Please try again with a shorter video." (retry до 3 попыток)
- **Invalid URL:** Показать "Invalid upload URL. Please start a new assessment."
- **Max Retries Reached:** После 3 неудачных попыток → показать "Upload failed after 3 attempts. Please record again."

### 4. User Experience

#### 4.1. UI Components
- **Video Preview:** `<video>` элемент для live preview и playback
- **Recording Timer:** Отображать время записи (MM:SS format)
- **Progress Bar:** Для загрузки (linear progress bar)
- **Status Messages:** Toast notifications или inline messages
- **Buttons:** 
  - Primary: "Start Recording", "Stop Recording", "Upload Video"
  - Secondary: "Retry", "Cancel", "Continue"

#### 4.2. Mobile Responsiveness
- **Layout:** Адаптивный layout для mobile/tablet/desktop
- **Camera:** Использовать front-facing camera на mobile (если доступна)
- **Touch Controls:** Большие кнопки для touch interfaces
- **Orientation:** Поддержка portrait и landscape

#### 4.3. Accessibility
- **Keyboard Navigation:** Все кнопки доступны через Tab
- **Screen Readers:** ARIA labels для всех интерактивных элементов
- **Focus Management:** Правильный focus при смене состояний

### 5. Integration Points

#### 5.1. With Existing Features
- **Assessments:** Использует `assessmentId` и `uploadUrl` из `createAssessment` API
- **AssessmentNewPage:** Интегрируется в существующую страницу
- **Navigation:** После успешной загрузки → redirect к assessment detail page

#### 5.2. Backend Integration
- **Presigned URL:** Уже получен при создании assessment (POST /v1/assessments)
- **Video URL:** Backend обновляет assessment с S3 URL после загрузки (через S3 event или отдельный endpoint)
- **Status Update:** Assessment status меняется на "processing" после загрузки

---

## SUCCESS CRITERIA

1. ✅ User can start video recording with one click
2. ✅ Recording starts within 1 second after permission granted
3. ✅ Live preview shows camera feed during recording
4. ✅ Timer displays recording duration (MM:SS)
5. ✅ User can stop recording at any time
6. ✅ Recorded video preview shows after stopping
7. ✅ User can retry recording before upload
8. ✅ Video uploads to S3 using presigned URL
9. ✅ Upload progress shows 0-100%
10. ✅ Upload completes within 5 seconds for 45s video (на хорошем соединении, после компрессии)
11. ✅ Error handling works for all error cases
12. ✅ Works on Chrome, Firefox, Safari (desktop)
13. ✅ Works on iOS Safari, Chrome Mobile (mobile)
14. ✅ Mobile responsive design
15. ✅ Accessible (keyboard navigation, screen readers)

---

## EDGE CASES

### 1. Camera Permission Denied
- **Scenario:** User denies camera permission
- **Action:** Show clear instructions how to enable in browser settings
- **Fallback:** Allow user to upload pre-recorded video (future feature, не в MVP)

### 2. Camera Not Available
- **Scenario:** No camera detected on device
- **Action:** Show error "Camera not available. Please use a device with a camera."
- **Fallback:** None (required feature)

### 3. Recording Interrupted
- **Scenario:** User closes browser/tab during recording or upload
- **Action:** 
  - During recording: Recording stops, video lost (expected behavior)
  - During upload: Upload interrupted, video not uploaded
- **UX:** 
  - Show warning before leaving page if recording in progress (using `beforeunload` event)
  - Show warning before leaving page if upload in progress
  - After closing: User can create new assessment and try again

### 4. Network Failure During Upload
- **Scenario:** Network disconnects during upload
- **Action:** Show error, allow retry with same video blob (максимум 3 попытки)
- **Implementation:** 
  - Store video blob in memory until upload succeeds
  - Track retry count (max 3 attempts)
  - After 3 failures: Show error "Upload failed after 3 attempts. Please record again."

### 5. Upload Timeout
- **Scenario:** Upload takes > 60 seconds
- **Action:** Show timeout error, allow retry (максимум 3 попытки)
- **Suggestion:** Consider chunked upload for large videos (future improvement)

### 6. Presigned URL Expired
- **Scenario:** User waits too long before uploading (URL expires)
- **Action:** Show error "Upload URL expired. Please start a new assessment."
- **Prevention:** Create assessment right before recording starts

### 7. Video Too Large
- **Scenario:** Video > 50MB after recording and compression
- **Action:** Block upload, show error "Video too large. Please record a shorter video."
- **Note:** Compression через MediaRecorder settings должна уменьшить размер, но если все еще > 50MB → блокировать

### 8. Multiple Recordings
- **Scenario:** User records multiple times before uploading
- **Action:** Only last recording is kept, previous is discarded
- **UX:** Show confirmation "Previous recording will be lost. Continue?"

### 9. Browser Compatibility
- **Scenario:** Browser doesn't support WebRTC/MediaRecorder
- **Action:** Show error "Your browser doesn't support video recording. Please use Chrome, Firefox, or Safari."
- **Fallback:** None (required feature)

### 10. Low Storage Space
- **Scenario:** Device has low storage, can't save video blob
- **Action:** Show error "Insufficient storage. Please free up space and try again."
- **Detection:** Try-catch при создании Blob

---

## TECHNICAL CONSTRAINTS

### Frontend
- **Browser APIs:** 
  - `navigator.mediaDevices.getUserMedia()` для доступа к камере
  - `MediaRecorder` API для записи видео
  - `File` API для работы с video blob
- **Libraries:** 
  - Не использовать внешние библиотеки для записи (нативный API)
  - Можно использовать библиотеку для progress bar (опционально)
- **State Management:** 
  - Использовать React hooks (useState, useEffect)
  - Можно использовать Zustand store для глобального состояния (опционально)
- **Styling:** 
  - Tailwind CSS (следуя существующему стилю)
  - Responsive design (mobile-first)

### Performance
- **Recording Start:** < 1 second после permission granted
- **Upload Time:** < 5 seconds для 45s video (на хорошем соединении, после компрессии)
- **Memory Usage:** Минимизировать использование памяти (освобождать старые blobs)
- **Battery:** Оптимизировать для mobile (не держать camera active без необходимости)
- **Video Compression:** 
  - Target bitrate: ~2-3 Mbps для 720p
  - Resolution: максимум 1280x720
  - Codec: VP8/VP9 для WebM, H.264 для MP4

### Security
- **HTTPS Required:** getUserMedia() работает только на HTTPS (или localhost)
- **Permissions:** Запрашивать только video permission (не audio - согласно clarifications)
- **Data Privacy:** Не сохранять видео локально после upload
- **CORS:** Presigned URL должен иметь правильные CORS headers
- **Retry Limits:** Максимум 3 попытки upload для одной записи (согласно PRD 4.3.7.3)

---

## DESIGN CONSIDERATIONS

### UI Layout
```
┌─────────────────────────────────────┐
│  Assessment: Overhead Squat         │
│  Instructions: [text]               │
├─────────────────────────────────────┤
│                                     │
│     [Video Preview Area]            │
│     (Live feed or recorded video)   │
│                                     │
│     Timer: 00:45                    │
├─────────────────────────────────────┤
│  [Start Recording] [Stop] [Retry]   │
│  [Upload Video] [Cancel]            │
│                                     │
│  Progress: [████████░░] 80%         │
└─────────────────────────────────────┘
```

### Visual States
- **Ready:** Green "Start Recording" button, live preview
- **Recording:** Red "Stop Recording" button, timer, live preview
- **Stopped:** Preview of recorded video, "Upload" button
- **Uploading:** Progress bar, disabled buttons
- **Success:** Green checkmark, "Continue" button
- **Error:** Red error message, "Retry" button

### Mobile Considerations
- **Full Screen:** Video preview может занимать весь экран
- **Large Buttons:** Минимум 44x44px для touch targets
- **Orientation Lock:** Опционально lock orientation во время записи
- **Battery Indicator:** Показывать предупреждение если батарея < 20%

---

## DEPENDENCIES

### Existing Features
- ✅ **Assessments API:** `createAssessment` endpoint (уже реализован)
- ✅ **Presigned URLs:** S3 presigned URL generation (уже реализован)
- ✅ **AssessmentNewPage:** Страница создана (нужна реализация)

### External Services
- **S3:** Для хранения видео (уже настроен)
- **Browser APIs:** WebRTC, MediaRecorder (нативные API)

### Future Dependencies
- MediaPipe processing (после загрузки видео)
- Assessment status updates (после обработки)

---

## KNOWN LIMITATIONS (MVP)

1. **No Audio:** Только видео, без аудио (согласно clarifications - не требуется для MediaPipe)
2. **Basic Video Compression:** Компрессия через MediaRecorder settings (bitrate, resolution), без дополнительных библиотек
3. **No Chunked Upload:** Весь файл загружается одним запросом
4. **No Pre-recorded Upload:** Только запись через браузер (нельзя загрузить файл)
5. **No Video Editing:** Нет возможности обрезать/редактировать видео перед upload
6. **Limited Browser Support:** Требует современный браузер с MediaRecorder API
7. **Max Duration:** 45 секунд (не 60, согласно PRD 4.3.7.1)

---

## FUTURE IMPROVEMENTS

1. **Video Compression:** Сжимать видео перед upload для уменьшения размера
2. **Chunked Upload:** Загружать видео частями для больших файлов
3. **Pre-recorded Upload:** Позволить загружать предварительно записанные видео
4. **Video Editing:** Базовая обрезка видео перед upload
5. **Audio Support:** Добавить запись аудио (инструкции, комментарии)
6. **Multiple Camera Support:** Выбор между front/back камерой
7. **Video Filters:** Базовые фильтры для улучшения качества
8. **Offline Support:** Сохранение видео локально для upload позже

---

## TESTING REQUIREMENTS

### Unit Tests
- Video validation functions
- Upload progress calculation
- State management logic

### Integration Tests
- Camera permission flow
- Recording start/stop
- Upload to S3 with presigned URL

### E2E Tests
- Complete flow: create assessment → record video → upload → verify
- Error scenarios: permission denied, network failure, timeout
- Mobile browser testing (iOS Safari, Chrome Mobile)

### Manual Testing
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iOS, Android)
- Network conditions (slow 3G, offline)
- Camera availability (no camera, permission denied)

---

## RELATED DOCUMENTS

- `docs/requirements/PRD.md` - Section 4.3 (MediaPipe Assessment)
- `.specify/features/assessments/spec.md` - Assessments feature specification
- `.specify/constitution.md` - Technical standards and conventions
- `src/frontend/src/pages/AssessmentNewPage.tsx` - Current implementation (placeholder)

---

**Последнее обновление:** 2026-01-06

