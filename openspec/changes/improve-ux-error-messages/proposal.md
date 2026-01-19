# Change: Improve Error Messages to Human Language (P0)

## Why

**Problem:** Current error messages show technical codes and error language, which creates poor user experience:
- Users see "LOW_CONFIDENCE", "WRONG_ANGLE", "INVALID_VIDEO"
- Technical language scares users ("I don't understand")
- Users think "I'm not suitable for this app" instead of "I can fix this"
- No actionable guidance (list of errors, not single clear advice)
- Violates UX best practices (compassionate, helpful messaging)

**Current State:**
- Error messages use technical codes:
  - `INVALID_NO_PERSON`
  - `LOW_CONFIDENCE`
  - `WRONG_ANGLE`
  - `BAD_LIGHTING`
  - `NO_MOTION`
- Messages shown to users: "Video is invalid" + technical reason
- No human language translation
- Multiple errors shown at once (overwhelming)

**Example Problem:**
```
User sees:
"Video is invalid: LOW_CONFIDENCE"

User thinks:
- "What does LOW_CONFIDENCE mean?"
- "Is my camera broken?"
- "Am I doing this wrong?"
- "Maybe this app isn't for me"

User leaves (frustrated)
```

**Opportunity:** Replace technical error codes with human language messages following UX copy principles:
- Never apologize ("Sorry, we couldn't..." → "Let's try again")
- Always show progress ("Invalid" → "Almost there")
- One suggestion at a time (not a list)
- Use "we", not "you" ("Let's adjust" not "You need to...")
- Never mention technologies ("MediaPipe failed" → "We couldn't see clearly")
- Actionable guidance (one specific tip per error)

**Business Value:**
- Better user experience (users understand errors)
- Higher completion rates (users know how to fix issues)
- Reduced frustration (compassionate messaging)
- Better retention (users don't feel blamed)
- Professional UX (follows industry best practices)

## What Changes

**Modifications:**

1. **Error message mapping** — Create human language translations
   - Map technical error codes to human messages
   - Follow UX copy principles (no apology, show progress, one tip)
   - Each error type gets specific, actionable message

2. **Error message format** — Standardize error display
   - **Header:** Encouraging title (e.g., "Almost there")
   - **Message:** Specific, actionable tip (one suggestion)
   - **CTA:** Clear action button (e.g., "Record again")
   - **No technical codes** visible to users

3. **Backend error translation** — Add translation layer
   - Create error message mapping service
   - Translate technical codes to human messages
   - Return structured error response (header, message, cta)

4. **Frontend error display** — Update error screens
   - Replace technical error display with human messages
   - Show one error at a time (not list)
   - Use encouraging, helpful tone
   - Add actionable CTA button

5. **Documentation updates** — Document UX copy principles
   - Add UX copy guidelines to project.md
   - Document error message format
   - Add examples of good vs bad messages

**BREAKING:** None (changes are to display logic, not data structure)

## Impact

**Affected specs:**
- `error-handling` — MODIFIED error message format
- `ux-copy-guidelines` — ADDED UX copy principles
- `quality-gates` — MODIFIED user-facing error messages

**Affected code:**

**Backend:**
- `src/backend/services/errorMessageService.ts` — NEW service
  - `translateErrorCode(errorCode, context)` function
  - Maps technical codes to human messages
  - Returns structured error response:
    ```typescript
    {
      header: "Almost there",
      message: "We couldn't clearly see your hips. Try moving the camera a bit higher.",
      cta: "Record again",
      errorType: "LOW_CONFIDENCE" // Internal only, not shown to user
    }
    ```
- `src/backend/handlers/test-engine.ts` — MODIFIED error response
  - Use error message service instead of raw error codes
  - Return human-readable error messages
- `src/backend/utils/errorMessages.ts` — NEW constants
  - Error message mapping (technical code → human message)
  - All error messages in one place

**Frontend:**
- `src/frontend/components/ErrorScreen.tsx` — MODIFIED or NEW
  - Display human error messages (header, message, cta)
  - Remove technical error codes from display
  - Use encouraging, helpful styling
- `src/frontend/components/TestRecorder.tsx` — MODIFIED
  - Handle new error message format
  - Display error messages using ErrorScreen component
- `src/frontend/utils/errorHandling.ts` — MODIFIED
  - Parse error response format
  - Extract header, message, cta

**Documentation:**
- `openspec/project.md` — MODIFIED MVP UX Rules section
  - Add UX copy principles
  - Add error message examples
- `docs/requirements/PRD.md` — MODIFIED Quality gates section
  - Update error message format description
  - Remove technical error codes from user-facing documentation

**Migration:**
- **No data migration:** Changes are to display logic only
- **Backward compatibility:** Keep error codes internally for logging/debugging
- **Testing:** Update tests to expect new error message format

**Risks:**
- **Low risk:** Changes are to display logic only
- **Testing:** Need thorough testing of all error scenarios
- **Content:** Need to write good error messages (may require copy review)
- **Localization:** Error messages need to be in English (MVP language)

## Error Message Mapping

**LOW_CONFIDENCE:**
```
Header: "Almost there"
Message: "We couldn't clearly see your hips. Try moving the camera a bit higher."
CTA: "Record again"
```

**WRONG_ANGLE:**
```
Header: "Let's adjust"
Message: "We need to see your full body. Try stepping back about one step."
CTA: "Try again"
```

**MOVEMENT_NOT_DETECTED:**
```
Header: "No movement detected"
Message: "Make sure to do the full squat movement. Watch the example again if needed."
CTA: "Watch example • Record again"
```

**VISIBILITY_POOR (lighting/clothing):**
```
Header: "Hard to see"
Message: "Try turning on more lights or moving to a brighter spot."
CTA: "Record again"
```

**NO_MOTION:**
```
Header: "No movement detected"
Message: "Make sure to perform the full movement. Watch the example to see the motion."
CTA: "Watch example • Record again"
```

**INVALID_NO_PERSON:**
```
Header: "Can't see you"
Message: "Make sure your full body is visible in the frame. Step back a bit."
CTA: "Try again"
```

**3rd failed attempt:**
```
Header: "Let's skip this one for now"
Message: "We can come back to it later. You'll still get useful insights from the other checks."
CTA: "Continue"
```

## Open Questions

- [ ] Should we show error codes in developer/debug mode? (Recommended: yes, but only in development)
- [ ] How to handle multiple simultaneous errors? (Recommended: show most critical one, fix it, then show next)
- [ ] Should error messages be stored in i18n files for future localization? (Recommended: yes, but English only for MVP)
- [ ] Do we need A/B testing for error messages? (Recommended: no for MVP, but consider for v1)
