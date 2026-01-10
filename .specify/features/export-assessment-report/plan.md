# Export Assessment Report - Technical Plan

**Дата создания:** 2025-01-03  
**Основано на:** spec.md, clarifications.md, constitution.md

---

## ARCHITECTURE

### High-Level Design

```
Frontend (React)
  ↓ HTTP GET
Backend API (Express)
  ↓
Assessment Controller
  ↓
PDF Service (pdfkit)
  ↓
PDF Buffer
  ↓
HTTP Response (binary)
  ↓
Browser Download
```

### Components

1. **Backend API Endpoint:** `GET /v1/assessments/:id/export`
2. **PDF Service:** `src/backend/services/pdfService.ts` (new)
3. **Frontend Button:** Added to `AssessmentDetailPage.tsx`
4. **Frontend API:** Added to `assessments.ts`

---

## DATABASE SCHEMA

**Изменения:** Нет изменений в схеме БД. Используем существующие данные из Assessments table.

**Данные для PDF:**
- Assessment data (из `GET /v1/assessments/:id`)
- User data (из `GET /v1/users/me` для имени пользователя)

---

## API ENDPOINTS

### New Endpoint

**GET /v1/assessments/:assessment_id/export**

**Authentication:** Required

**Request:**
- Path parameter: `assessment_id` (UUID)
- Headers: `Authorization: Bearer {token}`

**Response:**
- Status: 200 OK
- Headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="assessment-{test_name}-{date}.pdf"`
- Body: PDF binary data

**Errors:**
- 401: Unauthorized
- 404: Assessment not found
- 403: Access denied (not owner)
- 500: PDF generation failed

**Example:**
```bash
GET /v1/assessments/123e4567-e89b-12d3-a456-426614174000/export
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## BACKEND IMPLEMENTATION

### 1. PDF Service (`src/backend/services/pdfService.ts`)

**Purpose:** Generate PDF from assessment data

**Dependencies:**
- `pdfkit` (npm package)
- Assessment data structure
- User data (optional)

**Functions:**
```typescript
export async function generateAssessmentPDF(
  assessment: Assessment,
  user?: { name?: string; email: string }
): Promise<Buffer>
```

**PDF Structure:**
1. Header section (logo/branding, title)
2. Assessment info (test name, date, user name)
3. Results section (score, confidence, quality metrics)
4. Problem areas list
5. Recommendations section
6. Footer (disclaimer)

**Styling:**
- A4 page size (210mm × 297mm)
- 20mm margins
- System fonts (Arial/Helvetica)
- Brand colors from config

### 2. Assessment Controller Update

**File:** `src/backend/api/controllers/assessmentController.ts`

**New Function:**
```typescript
export async function exportAssessment(req: AuthRequest, res: Response): Promise<void>
```

**Process:**
1. Authenticate user
2. Get assessment by ID
3. Verify ownership (user_id match)
4. Get user profile (for name)
5. Generate PDF using pdfService
6. Return PDF as binary response

### 3. Assessment Routes Update

**File:** `src/backend/api/routes/assessmentRoutes.ts`

**New Route:**
```typescript
router.get('/:assessment_id/export', assessmentController.exportAssessment);
```

**Order:** Add before `/:assessment_id` route (to avoid route conflict)

---

## FRONTEND IMPLEMENTATION

### 1. API Client Update

**File:** `src/frontend/src/api/assessments.ts`

**New Function:**
```typescript
exportAssessment: async (assessmentId: string): Promise<Blob> => {
  const response = await apiClient.get(`/assessments/${assessmentId}/export`, {
    responseType: 'blob',
  });
  return response.data;
}
```

### 2. Assessment Detail Page Update

**File:** `src/frontend/src/pages/AssessmentDetailPage.tsx`

**Changes:**
1. Add "Export PDF" button
2. Add loading state for export
3. Add error handling
4. Implement download function

**Button Placement:**
- Near assessment title/header
- Or in actions section
- Styled with Tailwind (btn btn-secondary or btn-primary)

**Download Function:**
```typescript
const handleExportPDF = async () => {
  setExporting(true);
  try {
    const blob = await assessmentsApi.exportAssessment(assessmentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessment-${assessment.test_name}-${new Date(assessment.created_at).toISOString().split('T')[0]}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    // Handle error
  } finally {
    setExporting(false);
  }
};
```

---

## DEPENDENCIES

### Backend
- **pdfkit:** `^0.13.0` (PDF generation)
- **@types/pdfkit:** `^0.13.0` (TypeScript types)

**Installation:**
```bash
cd src/backend
npm install pdfkit @types/pdfkit
```

### Frontend
- **No new dependencies:** Используем существующие (axios, React)

---

## STATE MANAGEMENT

### Frontend State
- `exporting: boolean` - Loading state for export button
- No global state needed (local component state)

### Backend State
- No persistent state (stateless PDF generation)

---

## ERROR HANDLING

### Backend
1. **Assessment not found:** Return 404
2. **Access denied:** Return 403
3. **PDF generation error:** Log to CloudWatch, return 500 with message
4. **Timeout:** Lambda timeout (30s) - unlikely for PDF generation

### Frontend
1. **Network error:** Show error message, allow retry
2. **404/403:** Show appropriate error, redirect if needed
3. **500:** Show "Export failed. Please try again."

---

## TESTING

### Unit Tests
- PDF service: Test PDF generation with mock data
- Controller: Test export endpoint with various scenarios

### Integration Tests
- Full flow: Request → PDF generation → Download
- Error scenarios: 404, 403, 500

### Manual Testing
- Test on Chrome, Firefox, Safari
- Test on mobile browsers
- Test with different assessment statuses
- Test error scenarios

---

## PERFORMANCE CONSIDERATIONS

### PDF Generation
- **Target:** < 3 seconds
- **Optimization:** 
  - Generate in memory (no file system)
  - Stream PDF if possible
  - Minimize PDF size

### Lambda Constraints
- **Memory:** 512MB-1024MB (should be sufficient)
- **Timeout:** 30s (more than enough)
- **Cold start:** Acceptable for on-demand export

### File Size
- **Target:** < 2MB
- **Optimization:**
  - Compress images (if any)
  - Optimize fonts
  - Minimize content

---

## SECURITY

### Access Control
- User must be authenticated
- User can only export own assessments
- Verify ownership before PDF generation

### Data Privacy
- PDF contains user data (assessment results)
- Ensure secure transmission (HTTPS)
- No sensitive data in logs

---

## INTEGRATION POINTS

### With Existing Features
- **Assessments API:** Uses existing `GET /v1/assessments/:id`
- **User API:** Uses existing `GET /v1/users/me` (optional, for name)
- **Authentication:** Uses existing auth middleware

### Future Integration
- **AI Plan Generator:** When implemented, include recommendations in PDF
- **Email Service:** Future feature to email PDF

---

## DEPLOYMENT

### Backend
- Deploy via Serverless Framework
- No infrastructure changes needed
- New Lambda handler for export endpoint

### Frontend
- Deploy via Vercel
- No build changes needed
- New API call in existing code

---

## ROLLBACK PLAN

If issues occur:
1. Remove export button from frontend (quick fix)
2. Disable export endpoint (return 503)
3. Revert code changes if needed

---

## SUCCESS METRICS

- PDF generation time: < 3 seconds (p95)
- Success rate: > 95%
- File size: < 2MB
- User satisfaction: Positive feedback

---

**Следующий шаг: /tasks - разбить на задачи**



