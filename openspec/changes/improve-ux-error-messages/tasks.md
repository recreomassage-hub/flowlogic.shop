# Implementation Tasks

## 1. Error Message Mapping

- [ ] 1.1 Create `src/backend/utils/errorMessages.ts`
  - Define error message mapping (technical code → human message)
  - Error types:
    - LOW_CONFIDENCE
    - WRONG_ANGLE
    - MOVEMENT_NOT_DETECTED
    - VISIBILITY_POOR
    - NO_MOTION
    - INVALID_NO_PERSON
    - 3RD_FAILED_ATTEMPT
  - Each mapping includes:
    - `header`: Encouraging title (e.g., "Almost there")
    - `message`: Specific, actionable tip (one suggestion)
    - `cta`: Clear action button (e.g., "Record again")
  - Follow UX copy principles (no apology, show progress, one tip)

- [ ] 1.2 Define error message structure
  ```typescript
  interface ErrorMessage {
    header: string;
    message: string;
    cta: string;
    errorType: string; // Internal only, not shown to user
  }
  ```

## 2. Backend Error Translation Service

- [ ] 2.1 Create `src/backend/services/errorMessageService.ts`
  - `translateErrorCode(errorCode, context)` function
  - Maps technical codes to human messages
  - Returns structured ErrorMessage response
  - Handles context (e.g., test name, attempt number)

- [ ] 2.2 Update `src/backend/handlers/test-engine.ts`
  - Replace raw error codes with error message service
  - Use `translateErrorCode()` for all user-facing errors
  - Keep error codes internally for logging/debugging
  - Return structured error response

- [ ] 2.3 Update quality gate error responses
  - LOW_CONFIDENCE → "Almost there - try moving camera higher"
  - WRONG_ANGLE → "Let's adjust - try stepping back"
  - MOVEMENT_NOT_DETECTED → "No movement detected - watch example again"
  - VISIBILITY_POOR → "Hard to see - try more lighting"
  - NO_MOTION → "No movement detected - perform full movement"
  - INVALID_NO_PERSON → "Can't see you - step back"
  - 3RD_FAILED_ATTEMPT → "Let's skip this one for now"

- [ ] 2.4 Update error response format in API
  - Change from: `{ status: "INVALID", error: "LOW_CONFIDENCE" }`
  - Change to: `{ status: "INVALID", header: "Almost there", message: "...", cta: "Record again" }`
  - Keep error code in internal logging only

## 3. Frontend Error Display

- [ ] 3.1 Create/Update `src/frontend/components/ErrorScreen.tsx`
  - Display human error messages (header, message, cta)
  - Remove technical error codes from display
  - Use encouraging, helpful styling
  - Handle different error types with appropriate styling

- [ ] 3.2 Update `src/frontend/components/TestRecorder.tsx`
  - Parse new error response format
  - Extract header, message, cta
  - Display error using ErrorScreen component
  - Remove technical error code display

- [ ] 3.3 Update `src/frontend/utils/errorHandling.ts`
  - Update error response parsing
  - Extract header, message, cta from response
  - Handle both old and new error formats (backward compatibility)
  - Map error codes to user-friendly messages (fallback)

- [ ] 3.4 Update all error displays
  - Assessment flow errors
  - Quality gate failures
  - Upload errors
  - Processing errors
  - Remove all technical error codes from user-facing UI

## 4. Documentation Updates

- [ ] 4.1 Update `openspec/project.md`
  - MVP UX Rules section: Add UX copy principles
  - Add error message examples
  - Document error message format
  - Add "good vs bad" message examples

- [ ] 4.2 Update `docs/requirements/PRD.md`
  - Quality gates section: Update error message format
  - Remove technical error codes from user-facing documentation
  - Add human language error message examples

- [ ] 4.3 Create UX copy guidelines document
  - Document UX copy principles:
    - Never apologize
    - Always show progress
    - One suggestion at a time
    - Use "we", not "you"
    - Never mention technologies
  - Add error message examples
  - Add guidelines for future error messages

## 5. Testing

- [ ] 5.1 Unit tests: errorMessageService
  - Test error code translation
  - Test all error types map correctly
  - Test context handling (test name, attempt number)

- [ ] 5.2 Unit tests: error message structure
  - Test all error messages have header, message, cta
  - Test error messages follow UX principles
  - Test no technical codes in user-facing messages

- [ ] 5.3 Integration tests: Error handling flow
  - Test error messages return correct format
  - Test error messages display correctly
  - Test all error scenarios

- [ ] 5.4 E2E tests: Error display
  - Test LOW_CONFIDENCE error displays correctly
  - Test WRONG_ANGLE error displays correctly
  - Test MOVEMENT_NOT_DETECTED error displays correctly
  - Test 3RD_FAILED_ATTEMPT error displays correctly
  - Test no technical codes visible to users

- [ ] 5.5 Manual testing: All error scenarios
  - Test all error types with real scenarios
  - Verify messages are helpful and actionable
  - Verify tone is encouraging, not blaming

## 6. Developer Tools (Optional)

- [ ] 6.1 Add error code display in development mode
  - Show technical error codes in dev environment only
  - Hide technical error codes in production
  - Useful for debugging

- [ ] 6.2 Add error message preview tool
  - Tool to preview all error messages
  - Useful for copy review
  - Optional, low priority

## 7. Deployment

- [ ] 7.1 Test in staging
  - Verify error messages display correctly
  - Verify all error scenarios work
  - Verify no technical codes visible

- [ ] 7.2 Deploy to production
  - Monitor error message displays
  - Monitor user feedback
  - Monitor error rates (should improve)

## Dependencies

```
1.x (Error Message Mapping) → blocks 2.x (Backend Service)
2.x (Backend Service) → blocks 3.x (Frontend Updates)
{2.x, 3.x} → blocks 4.x (Documentation)
{2.x, 3.x} → blocks 5.x (Testing)
{5.x} → blocks 6.x (Developer Tools, optional)
{5.x} → blocks 7.x (Deployment)
```
