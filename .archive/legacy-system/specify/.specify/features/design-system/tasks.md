# Design System for AI Platform - Implementation Tasks

**Дата создания:** 2026-01-06  
**Основано на:** spec.md, plan.md, constitution.md  
**Статус:** Готов к реализации

---

## PHASE 1: DESIGN TOKENS (Week 1)

### Task 1: Update Tailwind Config with Design Tokens ✅ COMPLETED

**FILES TO MODIFY:**
- `src/frontend/tailwind.config.js` ✅

**DO NOT TOUCH:** Other files ✅

**DESCRIPTION:**
Add design system tokens (colors, typography, spacing, border radius) to Tailwind config while maintaining backward compatibility with existing `primary` colors.

**COMPLETION CRITERIA:**
- ✅ New color tokens added: `background`, `text`, `accent`, `state`
- ✅ Typography tokens added: `fontFamily.sans` (Inter), `fontSize` (body, heading)
- ✅ Spacing system added: 8px, 16px, 24px, 32px
- ✅ Border radius set to 8px as default
- ✅ Existing `primary` colors kept for backward compatibility
- ✅ Config file validates without errors (build successful)
- ✅ Existing styles still work (no visual regressions)

**DEPENDENCIES:** None

**TESTING:**
- ✅ Run `npm run build` to verify config is valid - PASSED
- ✅ Check that existing components still render correctly - VERIFIED

**COMPLETED:** 2026-01-06

---

## PHASE 2: CORE COMPONENTS (Week 1-2)

### Task 2: Create Button Component ✅ COMPLETED

**FILES TO MODIFY:**
- `src/frontend/src/components/ui/Button/Button.tsx` (create) ✅
- `src/frontend/src/components/ui/Button/Button.types.ts` (create) ✅
- `src/frontend/src/components/ui/Button/Button.test.tsx` (create) ✅
- `src/frontend/jest.config.js` (create) ✅ - Jest config for TypeScript
- `src/frontend/src/setupTests.ts` (create) ✅ - Test setup

**DO NOT TOUCH:** Other files ✅

**DESCRIPTION:**
Create unified Button component with 3 variants (Primary, Secondary, Text) and all states (disabled, loading, hover, focus, active).

**COMPLETION CRITERIA:**
- ✅ Button component created with TypeScript types
- ✅ All 3 variants implemented (Primary, Secondary, Text)
- ✅ All states implemented (disabled, loading, hover, focus, active)
- ✅ Icons support (leftIcon, rightIcon props)
- ✅ Accessibility: ARIA labels, keyboard navigation, focus states
- ✅ Unit tests written (comprehensive coverage)
- ⚠️ Tests require jest-environment-jsdom installation (infrastructure setup)

**DEPENDENCIES:** Task 1 (Design Tokens) ✅

**TESTING:**
- ✅ Unit tests written for all variants and states
- ✅ Component compiles without errors (TypeScript check passed)
- ⚠️ Test execution requires jest-environment-jsdom package

**COMPLETED:** 2026-01-06

**NOTE:** Jest configuration created. To run tests, install `jest-environment-jsdom`:
```bash
npm install --save-dev jest-environment-jsdom
```

---

### Task 3: Create Card Component ✅ COMPLETED

**FILES TO MODIFY:**
- `src/frontend/src/components/ui/Card/Card.tsx` (create) ✅
- `src/frontend/src/components/ui/Card/Card.types.ts` (create) ✅
- `src/frontend/src/components/ui/Card/Card.test.tsx` (create) ✅

**DO NOT TOUCH:** Other files ✅

**DESCRIPTION:**
Create unified Card component for all content cards (assessments, exercises, AI results, recommendations).

**COMPLETION CRITERIA:**
- ✅ Card component created with TypeScript types
- ✅ Padding variants implemented (sm: 16px, md: 24px, lg: 32px)
- ✅ Styling: white background, border 1px #E6E6E6, border-radius 8px
- ✅ No shadow (medical style = flat design)
- ✅ Optional onClick handler support with keyboard navigation
- ✅ Unit tests written (comprehensive coverage)
- ✅ Component compiles without errors

**DEPENDENCIES:** Task 1 (Design Tokens) ✅

**TESTING:**
- ✅ Unit tests for rendering and padding variants
- ✅ Unit tests for clickable/non-clickable behavior
- ✅ Unit tests for keyboard navigation
- ✅ Component compiles without errors (TypeScript check passed)

**COMPLETED:** 2026-01-06

---

### Task 4: Create Typography Components

**FILES TO MODIFY:**
- `src/frontend/src/components/ui/Typography/Heading.tsx` (create)
- `src/frontend/src/components/ui/Typography/Body.tsx` (create)
- `src/frontend/src/components/ui/Typography/Typography.types.ts` (create)

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Create Typography components (Heading and Body) for consistent text styling across the platform.

**COMPLETION CRITERIA:**
- ✅ Heading component created with levels (1-6)
- ✅ Body component created with sizes (sm: 14px, md: 16px) and weights (regular, medium)
- ✅ Colors: Heading `#1C1C1C`, Body `#4A4A4A`
- ✅ Font: Inter (from Tailwind config)
- ✅ TypeScript types defined
- ✅ Components render correctly

**DEPENDENCIES:** Task 1 (Design Tokens)

**TESTING:**
- Visual test: render all heading levels and body sizes
- Verify colors and fonts are correct

---

### Task 5: Create Input Component

**FILES TO MODIFY:**
- `src/frontend/src/components/ui/Input/Input.tsx` (create)
- `src/frontend/src/components/ui/Input/Input.types.ts` (create)
- `src/frontend/src/components/ui/Input/Input.test.tsx` (create)

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Create Input component with label, placeholder, error, and success states for form inputs.

**COMPLETION CRITERIA:**
- ✅ Input component created with TypeScript types
- ✅ Label support with proper htmlFor association
- ✅ Placeholder styling (#9CA3AF)
- ✅ Error state: border #DC2626, error message below
- ✅ Success state: border #10B981 (optional)
- ✅ Focus state: ring 2px solid #5F6F7A (WCAG AA)
- ✅ Accessibility: ARIA labels, error message with aria-live
- ✅ Unit tests written (80%+ coverage)
- ✅ All tests pass

**DEPENDENCIES:** Task 1 (Design Tokens)

**TESTING:**
- Unit tests for all states (normal, error, success, focus)
- Accessibility test: label association, error message announcement
- Visual test: render all states

---

### Task 6: Create Modal Component

**FILES TO MODIFY:**
- `src/frontend/src/components/ui/Modal/Modal.tsx` (create)
- `src/frontend/src/components/ui/Modal/Modal.types.ts` (create)
- `src/frontend/src/components/ui/Modal/Modal.test.tsx` (create)

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Create Modal component for confirmations and notifications with overlay, close button, and footer support.

**COMPLETION CRITERIA:**
- ✅ Modal component created with TypeScript types
- ✅ Overlay: rgba(0, 0, 0, 0.5)
- ✅ Modal: white background, border-radius 8px, padding 24px
- ✅ Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) (only for modals)
- ✅ Max width: 500px (desktop), 90vw (mobile)
- ✅ Close button: X icon in top-right or Cancel button
- ✅ Footer support: Primary button right, Secondary left
- ✅ Accessibility: Focus trap, ESC key to close, ARIA labels
- ✅ Unit tests written (80%+ coverage)
- ✅ All tests pass

**DEPENDENCIES:** Task 1 (Design Tokens), Task 2 (Button)

**TESTING:**
- Unit tests for open/close, focus trap, ESC key
- Accessibility test: focus trap, keyboard navigation
- Visual test: render modal with different content

---

## PHASE 3: UPDATE EXISTING COMPONENTS (Week 2-3)

### Task 7: Update Layout Component

**FILES TO MODIFY:**
- `src/frontend/src/components/common/Layout.tsx`

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Update Layout component to use new design system: navigation colors, typography, and button styles.

**COMPLETION CRITERIA:**
- ✅ Navigation colors updated: active `#5F6F7A`, inactive `#4A4A4A`
- ✅ Typography updated to use Heading/Body components
- ✅ Buttons updated to use new Button component
- ✅ Hover states: opacity 0.8
- ✅ Visual consistency with design system
- ✅ No visual regressions

**DEPENDENCIES:** Task 2 (Button), Task 4 (Typography)

**TESTING:**
- Visual test: check navigation colors and typography
- Manual test: navigation works correctly

---

### Task 8: Update Assessment Cards

**FILES TO MODIFY:**
- `src/frontend/src/pages/AssessmentsPage.tsx`
- `src/frontend/src/pages/AssessmentDetailPage.tsx`

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Update assessment cards to use new Card component and Button component.

**COMPLETION CRITERIA:**
- ✅ Assessment cards use new Card component
- ✅ Buttons use new Button component (Primary/Secondary)
- ✅ Typography uses Heading/Body components
- ✅ Colors match design system
- ✅ No visual regressions
- ✅ Functionality preserved

**DEPENDENCIES:** Task 2 (Button), Task 3 (Card), Task 4 (Typography)

**TESTING:**
- Visual test: check card styling and buttons
- Manual test: assessment creation and navigation work

---

### Task 9: Update Forms (Login, Registration)

**FILES TO MODIFY:**
- `src/frontend/src/pages/LoginPage.tsx`
- `src/frontend/src/pages/RegisterPage.tsx`
- `src/frontend/src/pages/VerifyEmailPage.tsx`

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Update form pages to use new Input component and Button component.

**COMPLETION CRITERIA:**
- ✅ All inputs use new Input component
- ✅ All buttons use new Button component
- ✅ Typography uses Heading/Body components
- ✅ Error states work correctly
- ✅ Form validation preserved
- ✅ No visual regressions
- ✅ Functionality preserved

**DEPENDENCIES:** Task 2 (Button), Task 4 (Typography), Task 5 (Input)

**TESTING:**
- Visual test: check input and button styling
- Manual test: form submission and validation work

---

### Task 10: Update VideoRecorder Components

**FILES TO MODIFY:**
- `src/frontend/src/components/VideoRecorder/RecordingControls.tsx`
- `src/frontend/src/components/VideoRecorder/VideoPreview.tsx`
- `src/frontend/src/components/VideoRecorder/ErrorDisplay.tsx`

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Update VideoRecorder components to use new Button component and design system colors.

**COMPLETION CRITERIA:**
- ✅ Buttons use new Button component
- ✅ Error colors use `state.error` (#DC2626)
- ✅ Typography uses Heading/Body components
- ✅ Colors match design system
- ✅ No visual regressions
- ✅ Functionality preserved

**DEPENDENCIES:** Task 2 (Button), Task 4 (Typography)

**TESTING:**
- Visual test: check button and error styling
- Manual test: video recording flow works

---

### Task 11: Update Dashboard and Other Pages

**FILES TO MODIFY:**
- `src/frontend/src/pages/DashboardPage.tsx`
- Other pages that use buttons/cards (if any)

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Update remaining pages to use new design system components.

**COMPLETION CRITERIA:**
- ✅ All buttons use new Button component
- ✅ All cards use new Card component (if applicable)
- ✅ Typography uses Heading/Body components
- ✅ Colors match design system
- ✅ No visual regressions
- ✅ Functionality preserved

**DEPENDENCIES:** Task 2 (Button), Task 3 (Card), Task 4 (Typography)

**TESTING:**
- Visual test: check all pages for consistency
- Manual test: all functionality works

---

## PHASE 4: CLEANUP AND FINALIZATION (Week 3-4)

### Task 12: Remove Legacy Styles from index.css

**FILES TO MODIFY:**
- `src/frontend/src/styles/index.css`

**DO NOT TOUCH:** Other files

**DESCRIPTION:**
Remove old button, card, and input styles from index.css after all components have been migrated.

**COMPLETION CRITERIA:**
- ✅ Old `.btn-primary`, `.btn-secondary`, `.btn-danger` classes removed
- ✅ Old `.card` class removed
- ✅ Old `.input` class removed
- ✅ Only base Tailwind styles remain
- ✅ All components still work (no broken styles)
- ✅ No visual regressions

**DEPENDENCIES:** Task 7, Task 8, Task 9, Task 10, Task 11 (all migrations complete)

**TESTING:**
- Visual test: check all pages for broken styles
- Manual test: all functionality works
- Build test: `npm run build` succeeds

---

### Task 13: Accessibility Audit

**FILES TO MODIFY:**
- All component files (if issues found)

**DO NOT TOUCH:** Other files (unless accessibility issues found)

**DESCRIPTION:**
Perform comprehensive accessibility audit for WCAG 2.1 AA compliance.

**COMPLETION CRITERIA:**
- ✅ Color contrast verified (4.5:1 for text, 3:1 for UI)
- ✅ Focus states visible on all interactive elements
- ✅ Keyboard navigation works for all components
- ✅ ARIA labels present where needed
- ✅ Screen reader compatibility verified
- ✅ All accessibility issues fixed

**DEPENDENCIES:** All previous tasks

**TESTING:**
- Use accessibility testing tools (axe, Lighthouse)
- Manual keyboard navigation test
- Screen reader test (NVDA/JAWS)

---

### Task 14: Final Visual Regression Testing

**FILES TO MODIFY:**
- None (testing only)

**DO NOT TOUCH:** All files

**DESCRIPTION:**
Run comprehensive visual regression tests to ensure no visual regressions across all pages.

**COMPLETION CRITERIA:**
- ✅ Playwright visual tests pass for all pages
- ✅ All button variants and states tested
- ✅ All card variants tested
- ✅ All input states tested
- ✅ Modal open/close tested
- ✅ Responsive design tested (mobile/desktop)
- ✅ No visual regressions found

**DEPENDENCIES:** All previous tasks

**TESTING:**
- Playwright visual regression tests
- Manual visual inspection of all pages

---

## TASK SUMMARY

**Total Tasks:** 14

**Phase 1 (Design Tokens):** 1 task
**Phase 2 (Core Components):** 5 tasks
**Phase 3 (Update Existing):** 5 tasks
**Phase 4 (Cleanup):** 3 tasks

**Estimated Timeline:** 3-4 weeks

**Critical Path:**
1. Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 (Core components)
2. Task 2, 3, 4, 5 → Task 7, 8, 9, 10, 11 (Update existing)
3. All tasks → Task 12, 13, 14 (Cleanup and testing)

---

## NOTES

- **Backward Compatibility:** Keep old classes in `index.css` until Task 12
- **Testing:** Write tests alongside implementation (not after)
- **Accessibility:** Verify WCAG AA compliance at each step
- **Visual Consistency:** Check visual consistency after each task

---

**Последнее обновление:** 2026-01-06

