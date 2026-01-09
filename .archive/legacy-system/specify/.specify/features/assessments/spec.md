# Assessments - Retrospective Specification

**Тип:** Ретроспективная спецификация  
**Дата создания:** 2025-01-03  
**Статус:** Существующая фича

---

## OVERVIEW

Система создания и управления оценками движения (assessments) через MediaPipe тесты. Пользователи могут создавать оценки, загружать видео, получать результаты анализа.

---

## CURRENT IMPLEMENTATION

### Backend
- **Routes:** `src/backend/api/routes/assessmentRoutes.ts`
- **Controller:** `src/backend/api/controllers/assessmentController.ts`
- **Model:** `src/backend/db/models/Assessment.ts`
- **Storage:** AWS S3 (presigned URLs)

### Frontend
- **Pages:**
  - `src/frontend/src/pages/AssessmentsPage.tsx` (список оценок)
  - `src/frontend/src/pages/AssessmentDetailPage.tsx` (детали оценки)
  - `src/frontend/src/pages/AssessmentNewPage.tsx` (новая оценка)
- **API:** `src/frontend/src/api/assessments.ts`

---

## REQUIREMENTS

### 1. Get Assessments List
- **Endpoint:** `GET /v1/assessments`
- **Authentication:** Required
- **Query Parameters:**
  - `month` (optional): Filter by month (YYYY-MM format)
  - `test_id` (optional): Filter by test type (1-15)
- **Process:**
  1. Authenticate user
  2. Query DynamoDB by user_id
  3. Apply filters if provided
  4. Return assessments sorted by date (newest first)
- **Output:**
  - `assessments`: Array of Assessment objects
- **Errors:**
  - 401: Unauthorized
  - 500: Internal server error

### 2. Create Assessment
- **Endpoint:** `POST /v1/assessments`
- **Authentication:** Required
- **Input:**
  - `test_id` (required, number, 1-15)
- **Process:**
  1. Authenticate user
  2. Validate test_id (1-15)
  3. Check user tier limits (TODO: implement proper limit checking)
  4. Get test name from catalog
  5. Generate presigned URL for S3 upload
  6. Create assessment record in DynamoDB
  7. Return assessment_id and upload_url
- **Output:**
  - `assessment_id`: UUID
  - `upload_url`: S3 presigned URL
  - `expires_in`: URL expiration time (seconds)
- **Errors:**
  - 400: Invalid test_id
  - 401: Unauthorized
  - 404: User not found
  - 500: Internal server error

### 3. Get Assessment Details
- **Endpoint:** `GET /v1/assessments/:assessment_id`
- **Authentication:** Required
- **Process:**
  1. Authenticate user
  2. Get assessment from DynamoDB
  3. Verify ownership (user_id match)
  4. Return assessment details
- **Output:** Assessment object with full details
- **Errors:**
  - 401: Unauthorized
  - 404: Assessment not found
  - 403: Access denied (not owner)

### 4. Update Assessment
- **Endpoint:** `PUT /v1/assessments/:assessment_id`
- **Authentication:** Required
- **Input:**
  - `video_uploaded` (boolean): Mark video as uploaded
  - `status` (optional): Update status
  - `result` (optional): Assessment results
- **Process:**
  1. Authenticate user
  2. Verify ownership
  3. Update assessment in DynamoDB
  4. If status = 'completed', set completed_at
- **Output:** Updated assessment object
- **Errors:**
  - 400: Invalid input
  - 401: Unauthorized
  - 404: Assessment not found
  - 403: Access denied

---

## TEST CATALOG

Elite catalog with 15 tests:
1. Overhead Squat
2. Y-Balance Test
3. Single Leg Squat
4. Functional Movement Screen
5. Shoulder Mobility
6. Hip Mobility
7. Ankle Mobility
8. Core Stability
9. Balance Test
10. Agility Test
11. Power Test
12. Endurance Test
13. Flexibility Test
14. Coordination Test
15. Reaction Time Test

---

## DATABASE SCHEMA

### Assessments Table (DynamoDB)
- **Primary Key:** 
  - `user_id` (PK)
  - `assessment_id` (SK, UUID)
- **GSIs:**
  - `test_id` (for filtering by test type)
  - `month_key` (for filtering by month, format: YYYY-MM)
- **Fields:**
  - `user_id`: string (PK)
  - `assessment_id`: string (SK, UUID)
  - `test_id`: number (1-15)
  - `test_name`: string
  - `video_url`: string (S3 URL)
  - `status`: 'processing' | 'completed' | 'failed' | 'invalid'
  - `attempt_number`: number (1-3 per day)
  - `quality_score`: number (0.0-1.0, optional)
  - `confidence_avg`: number (0.0-1.0, optional)
  - `motion_variance`: number (0.0-1.0, optional)
  - `result`: AssessmentResult (optional)
  - `feedback`: string (optional, error reason if invalid)
  - `created_at`: ISO timestamp
  - `completed_at`: ISO timestamp (optional)
  - `month_key`: string (YYYY-MM format)

### AssessmentResult Interface
```typescript
{
  score: 'pass' | 'limited' | 'significant';
  confidence: number; // 0.0-1.0
  problem_areas?: string[];
  normalized_output?: Record<string, any>;
}
```

---

## VIDEO UPLOAD FLOW

### 1. Create Assessment
```
User clicks "Start New Assessment"
→ Frontend calls POST /v1/assessments
→ Backend creates assessment record
→ Backend generates S3 presigned URL
→ Backend returns assessment_id + upload_url
```

### 2. Upload Video
```
Frontend navigates to /assessments/new
→ User records video (WebRTC)
→ Frontend uploads video to S3 using presigned URL
→ Frontend calls PUT /v1/assessments/:id { video_uploaded: true }
→ Backend updates assessment status
```

### 3. Process Assessment
```
(Backend Lambda triggered by S3 event or manual trigger)
→ Video processed by MediaPipe
→ Results stored in assessment.result
→ Status updated to 'completed'
```

---

## TIER LIMITS

### Free Tier
- 3 assessments per month
- No training plans
- Results only

### Basic Tier
- 3 assessments per month
- Training plans included
- Basic exercises

### Pro Tier
- 7 assessments per month
- Advanced training plans
- Progress tracking

### Pro+ Tier
- 15 assessments per month
- All features
- Retention improvements

**Note:** Limit checking is TODO in current implementation.

---

## STATUS FLOW

```
created → processing → completed
                    ↓
                 failed
                    ↓
                 invalid
```

- **processing:** Video uploaded, awaiting analysis
- **completed:** Analysis complete, results available
- **failed:** Analysis failed (technical error)
- **invalid:** Video quality insufficient or other validation failure

---

## INTEGRATION POINTS

### With Other Features
- **User Authentication:** Requires authenticated user
- **Subscriptions:** Tier limits affect assessment creation
- **S3 Storage:** Video upload via presigned URLs
- **MediaPipe Processing:** (Future) Video analysis Lambda

### External Services
- **AWS S3:** Video storage
- **DynamoDB:** Assessment data storage
- **MediaPipe:** (Future) Video analysis

---

## KNOWN ISSUES / LIMITATIONS

1. **Tier limits:** Not fully implemented (TODO in code)
2. **Video processing:** MediaPipe analysis not yet implemented
3. **Attempt limits:** Daily attempt limits (1-3) not enforced
4. **Error handling:** Some error cases not fully handled
5. **Video validation:** No client-side validation before upload
6. **Progress tracking:** No real-time upload progress

---

## FUTURE IMPROVEMENTS

1. **MediaPipe Integration:** Implement video analysis Lambda
2. **Real-time Processing:** WebSocket updates for processing status
3. **Video Validation:** Client-side validation before upload
4. **Progress Tracking:** Upload progress indicator
5. **Retry Logic:** Automatic retry for failed uploads
6. **Batch Operations:** Bulk assessment operations
7. **Export Results:** PDF/CSV export of results
8. **Comparison View:** Compare assessments over time
9. **Video Playback:** In-browser video playback
10. **Annotations:** Mark problem areas on video

---

## TESTING

### Test Cases
- [ ] Create assessment with valid test_id
- [ ] Create assessment with invalid test_id
- [ ] Get assessments list (all)
- [ ] Get assessments filtered by month
- [ ] Get assessments filtered by test_id
- [ ] Get assessment details
- [ ] Update assessment status
- [ ] Upload video to S3
- [ ] Verify ownership (access control)
- [ ] Tier limit enforcement (when implemented)

---

## RELATED FILES

### Backend
- `src/backend/api/routes/assessmentRoutes.ts`
- `src/backend/api/controllers/assessmentController.ts`
- `src/backend/db/models/Assessment.ts`
- `src/backend/config/s3.ts` (presigned URL generation)

### Frontend
- `src/frontend/src/pages/AssessmentsPage.tsx`
- `src/frontend/src/pages/AssessmentDetailPage.tsx`
- `src/frontend/src/pages/AssessmentNewPage.tsx`
- `src/frontend/src/api/assessments.ts`

---

**Это ретроспективная спецификация. Обновляйте при изменении фичи.**

