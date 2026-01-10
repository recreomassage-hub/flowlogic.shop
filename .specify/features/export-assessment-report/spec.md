# Export Assessment Report - Specification

**Тип:** Новая фича  
**Дата создания:** 2025-01-03  
**Статус:** В разработке

---

## OVERVIEW

Пользователи могут экспортировать результаты оценки (assessment) в PDF формат. PDF включает результаты теста, проблемные зоны, рекомендации и дату.

---

## REQUIREMENTS

### 1. Export Functionality
- **Trigger:** Кнопка "Export PDF" на странице деталей оценки
- **Input:** Assessment ID (из текущей страницы)
- **Output:** PDF файл для скачивания
- **Format:** PDF (Portable Document Format)
- **Naming:** `assessment-{test_name}-{date}.pdf` (например: `assessment-overhead-squat-2025-01-03.pdf`)

### 2. PDF Content
PDF должен включать:
- **Header:**
  - Flow Logic logo/branding
  - Assessment title (test name)
  - Date of assessment
  - User name (optional, if available)

- **Results Section:**
  - Overall score (pass/limited/significant)
  - Confidence level (0-100%)
  - Quality score (if available)
  - Motion variance (if available)

- **Problem Areas:**
  - List of identified problem areas
  - Visual indicators (if applicable)

- **Recommendations:**
  - General recommendations based on results
  - Next steps (if available)

- **Footer:**
  - Flow Logic website/contact
  - Disclaimer: "This is a wellness assessment, not a medical diagnosis"

### 3. User Experience
- **Button Location:** Assessment detail page, visible and accessible
- **Button Label:** "Export PDF" or "Download Report"
- **Loading State:** Show loading indicator during PDF generation
- **Error Handling:** Display user-friendly error message if export fails
- **Success:** PDF automatically downloads to user's device

### 4. Technical Requirements
- **Generation Time:** < 3 seconds for typical assessment
- **File Size:** < 2MB (optimized PDF)
- **Compatibility:** Works on desktop and mobile browsers
- **No External Dependencies:** Generate PDF on backend (not client-side)

---

## SUCCESS CRITERIA

1. ✅ User can click "Export PDF" button on assessment detail page
2. ✅ PDF generates within 3 seconds
3. ✅ PDF contains all required sections (header, results, problem areas, recommendations, footer)
4. ✅ PDF format is professional and matches design guidelines
5. ✅ PDF downloads automatically to user's device
6. ✅ Works on Chrome, Firefox, Safari (desktop)
7. ✅ Works on mobile browsers (iOS Safari, Chrome Mobile)
8. ✅ Error handling works correctly (network errors, invalid assessment, etc.)

---

## EDGE CASES

1. **Assessment without results:**
   - Show "Results pending" message in PDF
   - Still allow export (with limited content)

2. **Assessment with failed status:**
   - Show error message in PDF
   - Explain that results are not available

3. **Network failure during export:**
   - Show error message to user
   - Allow retry

4. **Large assessment data:**
   - PDF should still generate within time limit
   - Optimize content if needed

5. **User not authenticated:**
   - Redirect to login (handled by ProtectedRoute)

6. **Assessment not found:**
   - Show 404 error
   - Redirect to assessments list

---

## INTEGRATION POINTS

### With Existing Features
- **Assessments:** Uses assessment data from existing API
- **User Authentication:** Requires authenticated user
- **Assessment Detail Page:** Button added to existing page

### External Services
- **PDF Generation:** Backend library (pdfkit, puppeteer, or similar)
- **File Download:** Browser download API

---

## TECHNICAL CONSTRAINTS

### Backend
- Must use Node.js-compatible PDF library
- Should not exceed Lambda timeout (30s)
- Should not exceed Lambda memory limit (512MB-1024MB)

### Frontend
- Must work with existing React components
- Must follow Tailwind CSS styling
- Must use existing API client (axios)

### Performance
- PDF generation: < 3 seconds
- File size: < 2MB
- No blocking of UI during generation

---

## DESIGN CONSIDERATIONS

### PDF Layout
- **Page Size:** A4 (210mm × 297mm)
- **Margins:** 20mm on all sides
- **Fonts:** System fonts (Arial, Helvetica) for compatibility
- **Colors:** Brand colors from Tailwind config
- **Logo:** Flow Logic logo (if available, or text branding)

### Content Structure
```
┌─────────────────────────┐
│ Header (Logo + Title)   │
├─────────────────────────┤
│ Assessment Info         │
│ - Test Name             │
│ - Date                  │
│ - User Name (optional)  │
├─────────────────────────┤
│ Results                 │
│ - Overall Score         │
│ - Confidence            │
│ - Quality Metrics       │
├─────────────────────────┤
│ Problem Areas           │
│ - List of areas         │
├─────────────────────────┤
│ Recommendations         │
│ - Next steps            │
├─────────────────────────┤
│ Footer (Disclaimer)     │
└─────────────────────────┘
```

---

## FUTURE IMPROVEMENTS

1. **Email Export:** Send PDF via email
2. **Multiple Formats:** Export as CSV, JSON
3. **Comparison Reports:** Compare multiple assessments
4. **Custom Branding:** User-specific branding
5. **Print Optimization:** Better print layout
6. **Multi-language:** Support for other languages (post-MVP)

---

## RELATED FILES

### Backend (to be created)
- `src/backend/api/routes/assessmentRoutes.ts` (add export endpoint)
- `src/backend/api/controllers/assessmentController.ts` (add export handler)
- `src/backend/services/pdfService.ts` (new service for PDF generation)

### Frontend (to be modified)
- `src/frontend/src/pages/AssessmentDetailPage.tsx` (add export button)
- `src/frontend/src/api/assessments.ts` (add export API call)

---

**Это спецификация новой фичи. Следующий шаг: /clarify (если нужно) или /plan**



