## ADDED Requirements

### Requirement: Skip to Main Content Link

The system SHALL provide a "Skip to main content" link that appears on keyboard focus to allow users to bypass navigation and jump directly to the main content.

**Rationale:** Keyboard users and screen reader users need an efficient way to skip repetitive navigation elements on every page.

#### Scenario: Skip link appears on focus

- **GIVEN** user navigates to any page
- **WHEN** user presses Tab key (first focusable element)
- **THEN** skip link becomes visible
- **AND** skip link has text "Skip to main content"
- **AND** skip link has href="#main-content"

#### Scenario: Skip link navigates to main content

- **GIVEN** skip link is focused
- **WHEN** user presses Enter
- **THEN** page scrolls to main element with id="main-content"
- **AND** focus moves to main content area
- **AND** skip link becomes hidden again

#### Scenario: Skip link is visually hidden by default

- **GIVEN** user is not focused on skip link
- **WHEN** page loads
- **THEN** skip link is visually hidden (sr-only class)
- **AND** skip link is still accessible to screen readers

---

### Requirement: Page Titles

The system SHALL provide unique, descriptive page titles for all routes that identify both the page content and the site name.

**Rationale:** Screen reader users rely on page titles to understand their location and navigate between pages. Search engines also use page titles for SEO.

#### Scenario: Home page has descriptive title

- **GIVEN** user navigates to home page (/)
- **WHEN** page loads
- **THEN** browser tab shows title "Flow Logic - Movement Quality Assessment"
- **AND** screen reader announces the page title

#### Scenario: Login page has descriptive title

- **GIVEN** user navigates to login page (/login)
- **WHEN** page loads
- **THEN** browser tab shows title "Login - Flow Logic"
- **AND** screen reader announces the page title

#### Scenario: All pages have unique titles

- **GIVEN** user navigates between different pages
- **WHEN** each page loads
- **THEN** each page has a unique title
- **AND** all titles include "Flow Logic" for brand consistency
- **AND** page-specific part comes first (e.g., "Dashboard - Flow Logic")

---

### Requirement: Checkbox Label Association

The system SHALL ensure all checkboxes have properly associated labels using either the `htmlFor`/`id` pattern or by wrapping the input in a label element.

**Rationale:** Screen readers need to associate checkbox labels with their inputs to announce the purpose of the checkbox correctly.

#### Scenario: Checkbox has associated label

- **GIVEN** user views registration form
- **WHEN** checkbox for wellness disclaimer is rendered
- **THEN** checkbox input has id="wellness-checkbox"
- **AND** label element has htmlFor="wellness-checkbox"
- **AND** label text is associated with checkbox

#### Scenario: Screen reader announces checkbox label

- **GIVEN** checkbox has proper label association
- **WHEN** screen reader user navigates to checkbox
- **THEN** screen reader announces label text
- **AND** screen reader indicates checkbox state (checked/unchecked)

---

### Requirement: Error Message Association

The system SHALL programmatically associate error messages with form fields using `aria-describedby` and announce errors using `role="alert"` and `aria-live="assertive"`.

**Rationale:** Screen reader users need to be notified of errors immediately and understand which field has the error.

#### Scenario: Error message is announced

- **GIVEN** form submission fails with validation error
- **WHEN** error message appears
- **THEN** error div has role="alert"
- **AND** error div has aria-live="assertive"
- **AND** screen reader immediately announces error message

#### Scenario: Error is associated with form field

- **GIVEN** email field has validation error
- **WHEN** error message appears
- **THEN** email input has aria-invalid="true"
- **AND** email input has aria-describedby pointing to error message id
- **AND** screen reader user can navigate from field to error message

---

## MODIFIED Requirements

### Requirement: Form Accessibility

The system SHALL ensure all forms have proper label associations, error handling, and keyboard navigation support.

**Changes:** Enhanced existing form accessibility requirements to include error message association and improved label handling.

#### Scenario: Form has accessible labels (existing)

- **GIVEN** user views login form
- **WHEN** form is rendered
- **THEN** all inputs have associated labels
- **AND** labels use htmlFor/id pattern

#### Scenario: Form errors are accessible (new)

- **GIVEN** form submission fails
- **WHEN** error message appears
- **THEN** error is announced to screen reader
- **AND** error is associated with relevant form field
- **AND** user can navigate to error message via keyboard
