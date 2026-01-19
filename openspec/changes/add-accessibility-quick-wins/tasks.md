# Implementation Tasks

## 1. Setup & Dependencies
- [ ] 1.1 Install react-helmet-async: `npm install react-helmet-async`
- [ ] 1.2 Verify color contrast ratios using WebAIM Contrast Checker
- [ ] 1.3 Document current color contrast status

## 2. Skip Link (P0)
- [ ] 2.1 Add skip to main content link in Layout.tsx
- [ ] 2.2 Add id="main-content" to main element
- [ ] 2.3 Style skip link (sr-only, visible on focus)
- [ ] 2.4 Test keyboard navigation (Tab key)

## 3. Page Titles (P0)
- [ ] 3.1 Wrap App in HelmetProvider
- [ ] 3.2 Add Helmet to HomePage with title
- [ ] 3.3 Add Helmet to LoginPage with title
- [ ] 3.4 Add Helmet to RegisterPage with title
- [ ] 3.5 Add Helmet to DashboardPage with title
- [ ] 3.6 Add Helmet to TiersPage with title
- [ ] 3.7 Add Helmet to AssessmentsPage with title
- [ ] 3.8 Add Helmet to AssessmentNewPage with title
- [ ] 3.9 Add Helmet to AssessmentDetailPage with title
- [ ] 3.10 Add Helmet to VerifyEmailPage with title

## 4. Checkbox Label Association (P0)
- [ ] 4.1 Fix checkbox in RegisterPage: add id to input
- [ ] 4.2 Fix checkbox in RegisterPage: add htmlFor to label
- [ ] 4.3 Add aria-describedby for wellness disclaimer text
- [ ] 4.4 Test with screen reader (NVDA/VoiceOver)

## 5. Error Message Association (P1)
- [ ] 5.1 Add role="alert" to error divs in LoginPage
- [ ] 5.2 Add aria-live="assertive" to error divs
- [ ] 5.3 Add id to error divs
- [ ] 5.4 Add aria-describedby to form elements
- [ ] 5.5 Apply same fixes to RegisterPage
- [ ] 5.6 Test error announcements with screen reader

## 6. Color Contrast Verification (P0)
- [ ] 6.1 Verify text-gray-900 on bg-white (should pass)
- [ ] 6.2 Verify text-gray-600 on bg-white (should pass)
- [ ] 6.3 Verify text-primary-600 on bg-white
- [ ] 6.4 Verify text-white on bg-primary-600
- [ ] 6.5 Verify text-red-700 on bg-red-50
- [ ] 6.6 Fix any failing contrast ratios
- [ ] 6.7 Document contrast ratios in design system

## 7. Testing
- [ ] 7.1 Manual keyboard navigation test (Tab, Shift+Tab, Enter, Space, Escape)
- [ ] 7.2 Screen reader test (NVDA on Windows or VoiceOver on macOS)
- [ ] 7.3 Color contrast verification using WebAIM tool
- [ ] 7.4 Test skip link functionality
- [ ] 7.5 Verify page titles in browser tab

## 8. Documentation
- [ ] 8.1 Update accessibility audit report with fixes
- [ ] 8.2 Document color contrast ratios in design system
- [ ] 8.3 Add accessibility testing checklist to developer guide

## Dependencies
```
1.x (Setup) → blocks 2.x, 3.x, 4.x, 5.x, 6.x
2.x, 3.x, 4.x, 5.x, 6.x → blocks 7.x (Testing)
7.x (Testing) → blocks 8.x (Documentation)
```
