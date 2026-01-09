# Export Assessment Report - Implementation Tasks

**Дата создания:** 2025-01-03  
**Основано на:** spec.md, clarifications.md, plan.md

---

## Task 1: Install PDF Dependencies ✅

**FILES TO MODIFY:**
- `src/backend/package.json` (update)
- `src/backend/package-lock.json` (auto-generated)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ `pdfkit` package installed (version ^0.13.0)
- ✅ `@types/pdfkit` package installed (version ^0.13.0)
- ✅ Dependencies added to package.json
- ✅ `npm install` completed successfully

**DEPENDENCIES:** None

**STATUS:** ✅ COMPLETED

---

## Task 2: Create PDF Service ✅

**FILES TO MODIFY:**
- `src/backend/services/pdfService.ts` (create new)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ PDF service created with `generateAssessmentPDF` function
- ✅ Function accepts Assessment and optional User data
- ✅ Function returns PDF Buffer
- ✅ PDF includes all required sections:
  - Header (branding, title)
  - Assessment info (test name, date, user name)
  - Results section (score, confidence, quality metrics)
  - Problem areas list
  - Recommendations section
  - Footer (disclaimer)
- ✅ PDF uses A4 size, 20mm margins
- ✅ PDF uses system fonts (Arial/Helvetica)
- ✅ Error handling implemented

**DEPENDENCIES:** Task 1

**STATUS:** ✅ COMPLETED

---

## Task 3: Add Export Endpoint to Controller ✅

**FILES TO MODIFY:**
- `src/backend/api/controllers/assessmentController.ts` (update)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ New function `exportAssessment` added
- ✅ Function authenticates user
- ✅ Function gets assessment by ID
- ✅ Function verifies ownership (user_id match)
- ✅ Function gets user profile (optional, for name)
- ✅ Function calls pdfService.generateAssessmentPDF
- ✅ Function returns PDF with correct headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="..."`
- ✅ Error handling for 404, 403, 500

**DEPENDENCIES:** Task 2

**STATUS:** ✅ COMPLETED

---

## Task 4: Add Export Route ✅

**FILES TO MODIFY:**
- `src/backend/api/routes/assessmentRoutes.ts` (update)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ New route added: `GET /:assessment_id/export`
- ✅ Route uses authentication middleware
- ✅ Route calls `assessmentController.exportAssessment`
- ✅ Route placed before `/:assessment_id` route (to avoid conflict)

**DEPENDENCIES:** Task 3

**STATUS:** ✅ COMPLETED

---

## Task 5: Add Export API to Frontend ✅

**FILES TO MODIFY:**
- `src/frontend/src/api/assessments.ts` (update)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ New function `exportAssessment` added to `assessmentsApi`
- ✅ Function accepts `assessmentId: string`
- ✅ Function makes GET request to `/assessments/:id/export`
- ✅ Function uses `responseType: 'blob'`
- ✅ Function returns Blob
- ✅ Error handling implemented

**DEPENDENCIES:** Task 4 (backend endpoint must exist)

**STATUS:** ✅ COMPLETED

---

## Task 6: Add Export Button to Assessment Detail Page ✅

**FILES TO MODIFY:**
- `src/frontend/src/pages/AssessmentDetailPage.tsx` (update)

**DO NOT TOUCH:** Other files

**COMPLETION CRITERIA:**
- ✅ "Export PDF" button added to page
- ✅ Button placed in appropriate location (near title)
- ✅ Button styled with Tailwind CSS (btn classes)
- ✅ Loading state implemented (`exporting: boolean`)
- ✅ Button disabled during export
- ✅ Loading indicator shown during export ("Exporting...")
- ✅ `handleExportPDF` function implemented:
  - Calls `assessmentsApi.exportAssessment`
  - Creates blob URL
  - Creates download link
  - Triggers download
  - Cleans up blob URL
- ✅ Error handling with user-friendly messages
- ✅ Filename generated from assessment data

**DEPENDENCIES:** Task 5

**STATUS:** ✅ COMPLETED

---

## Task 7: Testing and Validation

**FILES TO MODIFY:**
- `src/backend/tests/assessmentController.test.ts` (create/update)
- `src/backend/tests/pdfService.test.ts` (create)
- Manual testing

**DO NOT TOUCH:** Production code (only tests)

**COMPLETION CRITERIA:**
- Unit tests for PDF service (generateAssessmentPDF)
- Unit tests for export controller (various scenarios)
- Integration test for full export flow
- Manual testing on Chrome, Firefox, Safari
- Manual testing on mobile browsers
- Test with different assessment statuses (completed, processing, failed)
- Test error scenarios (404, 403, 500)
- Verify PDF content and format
- Verify PDF file size (< 2MB)
- Verify PDF generation time (< 3 seconds)

**DEPENDENCIES:** Task 6

**TESTING:**
- All tests pass
- Manual testing completed
- No regressions in existing functionality

---

## IMPLEMENTATION ORDER

1. Task 1: Install dependencies (5 min)
2. Task 2: Create PDF service (1-2 hours)
3. Task 3: Add export endpoint to controller (30 min)
4. Task 4: Add export route (10 min)
5. Task 5: Add export API to frontend (15 min)
6. Task 6: Add export button to page (30 min)
7. Task 7: Testing and validation (1-2 hours)

**Total estimated time:** 4-6 hours

---

## NOTES

- PDF service is the most complex part - spend time on it
- Test PDF generation thoroughly before moving to frontend
- Ensure proper error handling at each step
- Follow constitution.md for code standards
- Use Zod for validation if needed

---

**Следующий шаг: /implement Task 1**

