# Video Recording for Assessments - Technical Plan

**Дата создания:** 2026-01-06  
**Основано на:** spec.md, clarifications.md, constitution.md

---

## ARCHITECTURE

### High-Level Design

```
Frontend (React)
  ├── AssessmentNewPage.tsx (main page)
  ├── VideoRecorder Component (new)
  │   ├── Camera Access (getUserMedia)
  │   ├── MediaRecorder (video recording)
  │   ├── Video Preview (after recording)
  │   └── S3 Upload (presigned URL)
  └── State Management (useState + custom hooks)

Backend (already exists)
  ├── POST /v1/assessments (creates assessment + presigned URL)
  └── S3 Event → Lambda (video processing, not in this feature)
```

### Component Hierarchy

```
AssessmentNewPage
  └── VideoRecorder
      ├── CameraPreview (live feed)
      ├── RecordingControls (start/stop buttons)
      ├── RecordingTimer (MM:SS display)
      ├── VideoPreview (recorded video playback)
      ├── UploadProgress (progress bar)
      └── ErrorDisplay (error messages)
```

---

## DATABASE SCHEMA

**Изменения:** Нет изменений в схеме БД. Используем существующую структуру Assessments.

**Данные:**
- `assessmentId` - уже получен при создании assessment
- `uploadUrl` - уже получен при создании assessment (presigned S3 URL)
- Video URL будет сохранен в assessment после загрузки (через S3 event или отдельный endpoint, не в scope этой фичи)

---

## API ENDPOINTS

### Existing Endpoint (используем)

**POST /v1/assessments**

**Request:**
```json
{
  "test_id": 1
}
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "upload_url": "https://s3.amazonaws.com/...",
  "status": "pending"
}
```

**Note:** Этот endpoint уже существует и возвращает `upload_url` (presigned S3 URL). Используем его для загрузки видео.

---

## FRONTEND IMPLEMENTATION

### 1. VideoRecorder Component

**File:** `src/frontend/src/components/VideoRecorder.tsx` (new)

**Purpose:** Основной компонент для записи и загрузки видео

**State Management:**
```typescript
type RecordingState = 
  | 'idle'           // Initial state
  | 'requesting'     // Requesting camera permission
  | 'ready'          // Camera ready, can start recording
  | 'recording'      // Currently recording
  | 'stopped'        // Recording stopped, showing preview
  | 'uploading'      // Uploading to S3
  | 'success'        // Upload successful
  | 'error';         // Error state

interface VideoRecorderState {
  state: RecordingState;
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  videoBlob: Blob | null;
  videoUrl: string | null;
  duration: number;  // seconds
  uploadProgress: number;  // 0-100
  error: string | null;
  retryCount: number;  // max 3
}
```

**Hooks:**
- `useState` для локального состояния
- `useRef` для video element, MediaRecorder, stream
- `useEffect` для cleanup (stop camera, revoke URLs)

**Functions:**
```typescript
// Camera access
const requestCameraAccess = async (): Promise<void>
const stopCamera = (): void

// Recording
const startRecording = async (): Promise<void>
const stopRecording = (): Promise<void>
const retryRecording = (): void

// Upload
const uploadVideo = async (uploadUrl: string): Promise<void>
const retryUpload = (): void

// Validation
const validateVideo = (blob: Blob): { valid: boolean; errors: string[] }
```

**MediaRecorder Configuration:**
```typescript
const options: MediaRecorderOptions = {
  mimeType: 'video/webm;codecs=vp8',  // Fallback to mp4 for Safari
  videoBitsPerSecond: 2500000,  // ~2.5 Mbps (compression)
};

// Fallback for Safari/iOS
if (!MediaRecorder.isTypeSupported(options.mimeType)) {
  options.mimeType = 'video/mp4;codecs=h264';
}
```

**Video Constraints:**
```typescript
const videoConstraints: MediaTrackConstraints = {
  width: { ideal: 1280, max: 1280 },
  height: { ideal: 720, max: 720 },
  frameRate: { ideal: 30, min: 24 },
  aspectRatio: { ideal: 16/9 },
};
```

### 2. VideoRecorder UI Components

**File:** `src/frontend/src/components/VideoRecorder/` (directory)

#### 2.1. CameraPreview.tsx
- Live camera feed
- Shows during `ready` and `recording` states
- `<video>` element with `srcObject={stream}`

#### 2.2. RecordingControls.tsx
- "Start Recording" button (idle/ready states)
- "Stop Recording" button (recording state)
- "Retry" button (stopped state, before upload)
- Disabled states based on recording state

#### 2.3. RecordingTimer.tsx
- Displays recording duration (MM:SS format)
- Updates every second during recording
- Auto-stops at 45 seconds (hard limit)

#### 2.4. VideoPreview.tsx
- Shows recorded video after stopping
- Playback controls (play/pause)
- Displays duration and file size
- "Retry" and "Upload" buttons

#### 2.5. UploadProgress.tsx
- Progress bar (0-100%)
- Percentage display
- Shows during `uploading` state

#### 2.6. ErrorDisplay.tsx
- Error messages
- Retry button (if retry count < 3)
- Clear error messages based on error type

### 3. Custom Hooks

#### 3.1. useVideoRecorder.ts

**File:** `src/frontend/src/hooks/useVideoRecorder.ts` (new)

**Purpose:** Encapsulate video recording logic

**API:**
```typescript
interface UseVideoRecorderReturn {
  state: RecordingState;
  stream: MediaStream | null;
  videoBlob: Blob | null;
  videoUrl: string | null;
  duration: number;
  uploadProgress: number;
  error: string | null;
  retryCount: number;
  
  // Actions
  requestCamera: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  retryRecording: () => void;
  uploadVideo: (uploadUrl: string) => Promise<void>;
  retryUpload: () => void;
  reset: () => void;
}
```

**Implementation:**
- Manages MediaStream lifecycle
- Handles MediaRecorder events
- Validates video (duration, size)
- Manages upload with progress tracking
- Handles retries (max 3 attempts)

#### 3.2. useBeforeUnload.ts

**File:** `src/frontend/src/hooks/useBeforeUnload.ts` (new)

**Purpose:** Warn user before leaving page during recording/upload

**API:**
```typescript
const useBeforeUnload = (
  enabled: boolean,
  message?: string
): void
```

**Usage:**
```typescript
useBeforeUnload(
  state === 'recording' || state === 'uploading',
  'Recording/upload in progress. Are you sure you want to leave?'
);
```

### 4. AssessmentNewPage Update

**File:** `src/frontend/src/pages/AssessmentNewPage.tsx`

**Changes:**
1. Import VideoRecorder component
2. Pass `assessmentId` and `uploadUrl` from location.state
3. Handle navigation after successful upload
4. Show loading state if assessmentId/uploadUrl missing

**Updated Structure:**
```typescript
export function AssessmentNewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessmentId, uploadUrl } = location.state || {};

  const handleUploadSuccess = () => {
    // Navigate to assessment detail page
    navigate(`/assessments/${assessmentId}`);
  };

  if (!assessmentId || !uploadUrl) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">Record Assessment Video</h1>
        <VideoRecorder
          assessmentId={assessmentId}
          uploadUrl={uploadUrl}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
}
```

### 5. Video Validation

**File:** `src/frontend/src/utils/videoValidation.ts` (new)

**Functions:**
```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateVideo = async (
  blob: Blob,
  duration: number
): Promise<ValidationResult>

// Checks:
// - Duration ≤ 45 seconds
// - Size ≤ 50MB
// - Format (WebM or MP4)
// - Optional: Motion detection (basic)
```

**Motion Detection (optional, P2):**
```typescript
export const detectMotion = async (
  videoBlob: Blob
): Promise<{ hasMotion: boolean; score: number }>
```

---

## BACKEND IMPLEMENTATION

**Изменения:** Нет изменений в backend. Используем существующий endpoint `POST /v1/assessments`, который уже возвращает `upload_url`.

**Note:** Загрузка видео в S3 происходит напрямую с клиента через presigned URL. Backend не участвует в процессе загрузки.

**Future:** После загрузки видео, S3 event может триггерить Lambda для обработки (MediaPipe), но это не в scope этой фичи.

---

## STATE MANAGEMENT

### Local State (useState)
- Recording state
- Video blob
- Upload progress
- Error messages
- Retry count

### No Global State Needed
- Video recording is page-specific
- No need to persist across navigation
- Use local component state

### URL State (useLocation)
- `assessmentId` and `uploadUrl` passed via location.state
- Navigation after success via `useNavigate`

---

## DEPENDENCIES

### Frontend
**Новые зависимости:** Нет. Используем нативные Web APIs:
- `getUserMedia()` - для доступа к камере
- `MediaRecorder` - для записи видео
- `fetch()` или `axios` - для загрузки в S3 (axios уже есть)

**Существующие:**
- React 18.2+
- React Router DOM 6.20+
- Axios 1.6+
- Tailwind CSS 3.3+

### Backend
**Изменения:** Нет. Backend уже поддерживает создание assessment с presigned URL.

---

## FILE STRUCTURE

```
src/frontend/src/
├── components/
│   └── VideoRecorder/
│       ├── VideoRecorder.tsx          # Main component
│       ├── CameraPreview.tsx          # Live camera feed
│       ├── RecordingControls.tsx     # Start/Stop buttons
│       ├── RecordingTimer.tsx       # Duration display
│       ├── VideoPreview.tsx           # Recorded video preview
│       ├── UploadProgress.tsx         # Progress bar
│       └── ErrorDisplay.tsx          # Error messages
├── hooks/
│   ├── useVideoRecorder.ts            # Recording logic hook
│   └── useBeforeUnload.ts             # Page leave warning
├── utils/
│   └── videoValidation.ts             # Video validation
└── pages/
    └── AssessmentNewPage.tsx         # Updated page
```

---

## ERROR HANDLING

### Error Types

1. **Camera Permission Denied**
   - Show instructions to enable in browser settings
   - Provide link to browser help page

2. **Camera Not Available**
   - Show error: "Camera not available. Please use a device with a camera."
   - No fallback (required feature)

3. **Recording Errors**
   - MediaRecorder errors → Show "Recording failed. Please try again."
   - Auto-retry not needed (user can manually retry)

4. **Upload Errors**
   - Network errors → Retry up to 3 times
   - S3 errors → Show "Upload failed. Please try again."
   - Timeout (60s) → Show "Upload timeout. Please try again."
   - After 3 failures → Show "Upload failed after 3 attempts. Please record again."

5. **Validation Errors**
   - Duration > 45s → Block upload, show error
   - Size > 50MB → Block upload, show error
   - Invalid format → Show error (shouldn't happen with MediaRecorder)

### Error Display
- Toast notifications (если есть toast library)
- Inline error messages (в ErrorDisplay component)
- User-friendly messages (no technical details)

---

## PERFORMANCE CONSIDERATIONS

### Memory Management
- **Release MediaStream:** Stop camera when component unmounts
- **Revoke Object URLs:** Clean up video preview URLs
- **Clear Video Blob:** After successful upload, clear blob from memory
- **Cleanup on Error:** Ensure cleanup even if errors occur

### Upload Optimization
- **Compression:** MediaRecorder settings (bitrate, resolution)
- **Timeout:** 60 seconds max for upload
- **Retry Logic:** Exponential backoff (optional, для будущего)

### Browser Compatibility
- **Chrome/Edge:** Full support (WebM)
- **Firefox:** Full support (WebM)
- **Safari:** MP4 fallback (H.264)
- **iOS Safari:** MP4, may have limitations
- **Mobile:** Test on real devices

---

## TESTING STRATEGY

### Unit Tests
**Framework:** Jest + React Testing Library

**Files to Test:**
- `useVideoRecorder.ts` - Hook logic
- `videoValidation.ts` - Validation functions
- `useBeforeUnload.ts` - Hook behavior

**Mock:**
- `getUserMedia()` - Mock MediaStream
- `MediaRecorder` - Mock recording events
- `fetch()` - Mock S3 upload

### Integration Tests
**Framework:** Jest + Playwright (optional)

**Scenarios:**
- Full recording flow (start → stop → upload)
- Error scenarios (permission denied, network error)
- Retry logic (3 attempts)

### Manual Testing
**Browsers:**
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Chrome Mobile (Android)
- Safari Mobile (iOS)

**Scenarios:**
- Happy path (record → preview → upload)
- Permission denied
- Network interruption
- Browser close during recording/upload
- Long recording (close to 45s limit)
- Large file (close to 50MB limit)

---

## ACCESSIBILITY

### Keyboard Navigation
- All buttons accessible via Tab
- Enter/Space to activate buttons
- Escape to cancel (optional)

### Screen Readers
- ARIA labels for all buttons
- ARIA live regions for status updates
- Descriptive error messages

### Focus Management
- Focus on "Start Recording" after camera ready
- Focus on "Upload" after recording stops
- Focus on error message when error occurs

---

## SECURITY

### Camera Access
- HTTPS required (getUserMedia only works on HTTPS or localhost)
- User permission required (browser native)
- No persistent storage of video locally

### S3 Upload
- Presigned URL (time-limited, secure)
- CORS configured on S3 bucket
- No sensitive data in video (user's own video)

### Validation
- Client-side validation (UX)
- Backend validation (security) - через S3 event processing

---

## FUTURE IMPROVEMENTS (Out of Scope)

1. **Chunked Upload:** Для больших файлов
2. **Video Editing:** Обрезка, фильтры
3. **Audio Recording:** Если потребуется
4. **Multiple Camera Support:** Выбор камеры
5. **Real-time Feedback:** Обратная связь во время записи
6. **Advanced Compression:** FFmpeg.js (слишком тяжелый для MVP)
7. **Motion Detection:** Более продвинутый анализ

---

## IMPLEMENTATION ORDER

### Phase 1: Core Recording
1. Create VideoRecorder component structure
2. Implement camera access (getUserMedia)
3. Implement recording (MediaRecorder)
4. Implement stop recording
5. Basic UI (camera preview, start/stop buttons)

### Phase 2: Preview & Validation
6. Implement video preview after recording
7. Implement video validation (duration, size)
8. Add recording timer
9. Add retry recording functionality

### Phase 3: Upload
10. Implement S3 upload (presigned URL)
11. Add upload progress tracking
12. Add retry upload logic (max 3 attempts)
13. Handle upload errors

### Phase 4: Polish
14. Add beforeunload warning
15. Improve error messages
16. Add accessibility (ARIA labels)
17. Mobile responsiveness
18. Testing

---

## SUCCESS CRITERIA

1. ✅ User can start recording with one click
2. ✅ Recording starts within 1 second
3. ✅ Live preview shows during recording
4. ✅ Timer displays duration (MM:SS)
5. ✅ Recording stops at 45 seconds (hard limit)
6. ✅ Video preview shows after stopping
7. ✅ User can retry recording
8. ✅ Video uploads to S3 successfully
9. ✅ Upload progress shows (0-100%)
10. ✅ Error handling works for all cases
11. ✅ Works on Chrome, Firefox, Safari
12. ✅ Works on mobile (iOS, Android)
13. ✅ Accessible (keyboard, screen readers)
14. ✅ No memory leaks (cleanup on unmount)

---

**Следующий шаг:** `/tasks` - разбить план на атомарные задачи



