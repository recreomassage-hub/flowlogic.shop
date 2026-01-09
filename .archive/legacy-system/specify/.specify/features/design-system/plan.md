# Design System for AI Platform - Technical Plan

**Дата создания:** 2026-01-06  
**Основано на:** spec.md, clarifications.md, constitution.md  
**Статус:** Готов к реализации

---

## ARCHITECTURE

### High-Level Design

```
Design System Implementation
├── Design Tokens (Tailwind Config)
│   ├── Colors (60-30-10 + states)
│   ├── Typography (Inter font)
│   ├── Spacing (8/16/24/32px)
│   └── Border Radius (8px)
│
├── Core Components (src/components/ui/)
│   ├── Button (Primary/Secondary/Text + states)
│   ├── Card (unified card component)
│   ├── Typography (Heading/Body)
│   ├── Input (form inputs with states)
│   └── Modal (dialog component)
│
└── Migration Strategy
    ├── Phase 1: Design Tokens
    ├── Phase 2: Core Components
    ├── Phase 3: Update Existing Components
    └── Phase 4: Remove Legacy Styles
```

### Component Structure

```
src/frontend/src/
├── components/
│   ├── ui/                    # NEW: Design system components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── Button.test.tsx
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.types.ts
│   │   │   └── Card.test.tsx
│   │   ├── Typography/
│   │   │   ├── Heading.tsx
│   │   │   ├── Body.tsx
│   │   │   └── Typography.types.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.types.ts
│   │   │   └── Input.test.tsx
│   │   └── Modal/
│   │       ├── Modal.tsx
│   │       ├── Modal.types.ts
│   │       └── Modal.test.tsx
│   ├── common/                 # EXISTING: Will be updated
│   │   └── Layout.tsx
│   └── VideoRecorder/          # EXISTING: Will be updated
│
├── styles/
│   └── index.css               # UPDATED: Remove legacy classes, keep base
│
└── tailwind.config.js          # UPDATED: Add design tokens
```

---

## DESIGN TOKENS (Tailwind Config)

### File: `src/frontend/tailwind.config.js`

**Current State:**
- Has basic `primary` color palette (blue)
- Basic theme extension

**Changes Required:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design System Colors (60-30-10)
      colors: {
        // Background (60%)
        background: {
          primary: '#FFFFFF',
          secondary: '#F8F8F8',
        },
        // Text & UI (30%)
        text: {
          heading: '#1C1C1C',
          body: '#4A4A4A',
          divider: '#E6E6E6',
        },
        // Accent (10%)
        accent: {
          primary: '#5F6F7A', // Slate blue
        },
        // States (not in 60-30-10)
        state: {
          error: '#DC2626',
          warning: '#F59E0B',
          success: '#10B981',
        },
        // Keep existing primary for backward compatibility during migration
        primary: {
          // ... existing primary colors
        },
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Inter as default
      },
      fontSize: {
        body: ['14px', { lineHeight: '20px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        heading: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      // Spacing System (8/16/24/32px)
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        // Keep existing spacing for backward compatibility
      },
      // Border Radius
      borderRadius: {
        DEFAULT: '8px', // 8px everywhere
      },
    },
  },
  plugins: [],
};
```

**Note:** Keep existing `primary` colors for backward compatibility during migration period.

---

## COMPONENTS

### 1. Button Component

**File:** `src/frontend/src/components/ui/Button/Button.tsx`

**Purpose:** Unified button component with 3 variants (Primary, Secondary, Text) and states

**Props Interface:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}
```

**Implementation Details:**
- **Primary:** Background `#5F6F7A`, text white, border-radius 8px
- **Secondary:** Transparent, border `1px solid #5F6F7A`, text `#5F6F7A`
- **Text:** No background/border, text `#5F6F7A`
- **States:**
  - Disabled: opacity 0.5, cursor not-allowed
  - Loading: spinner (16px), disabled state
  - Hover: opacity 0.9 or darker color (10%)
  - Focus: ring 2px solid #5F6F7A (WCAG AA)
  - Active: opacity 0.8 or darker color (15%)

**Accessibility:**
- ARIA labels for screen readers
- Keyboard navigation support
- Focus visible states

---

### 2. Card Component

**File:** `src/frontend/src/components/ui/Card/Card.tsx`

**Purpose:** Unified card component for all content cards

**Props Interface:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg'; // 16px, 24px, 32px
  onClick?: () => void;
}
```

**Implementation Details:**
- Background: `#FFFFFF`
- Border: `1px solid #E6E6E6`
- Border-radius: `8px`
- Padding: `16px` (sm), `24px` (md), `32px` (lg)
- **No shadow** (medical style = flat design)

**Usage:**
- Assessment cards
- Exercise cards
- AI result cards
- Recommendations

---

### 3. Typography Components

**Files:**
- `src/frontend/src/components/ui/Typography/Heading.tsx`
- `src/frontend/src/components/ui/Typography/Body.tsx`

**Purpose:** Consistent typography across the platform

**Heading Component:**
```typescript
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}
```

**Body Component:**
```typescript
interface BodyProps {
  size?: 'sm' | 'md' | 'lg'; // 14px, 16px
  weight?: 'regular' | 'medium';
  children: React.ReactNode;
  className?: string;
}
```

**Implementation Details:**
- Font: Inter (from Tailwind config)
- Heading: SemiBold/Bold, color `#1C1C1C`
- Body: Regular/Medium, color `#4A4A4A`
- Line heights: 20px (14px), 24px (16px)

---

### 4. Input Component

**File:** `src/frontend/src/components/ui/Input/Input.tsx`

**Purpose:** Form input with validation states

**Props Interface:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
}
```

**Implementation Details:**
- Background: `#FFFFFF`
- Border: `1px solid #E6E6E6`
- Border-radius: `8px`
- Padding: `12px 16px`
- Focus: Ring `2px solid #5F6F7A`, outline none
- Label: `#1C1C1C`, font-weight Medium, 14px
- Placeholder: `#9CA3AF`
- Error state: Border `#DC2626`, error message below
- Success state: Border `#10B981` (optional)

**Accessibility:**
- Label association (htmlFor)
- Error message with aria-live
- Focus states

---

### 5. Modal Component

**File:** `src/frontend/src/components/ui/Modal/Modal.tsx`

**Purpose:** Modal dialog for confirmations and notifications

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Primary button right, Secondary left
  size?: 'sm' | 'md' | 'lg';
}
```

**Implementation Details:**
- Overlay: `rgba(0, 0, 0, 0.5)`
- Modal: Background `#FFFFFF`, border-radius `8px`, padding `24px`
- Shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (only for modals)
- Max width: `500px` (desktop), `90vw` (mobile)
- Close button: X icon in top-right or Cancel button

**Accessibility:**
- Focus trap inside modal
- ESC key to close
- ARIA labels for modal role

---

## STATE MANAGEMENT

**No State Management Required**

Design system components are **presentational only**. They use:
- Local state via `useState` for internal states (loading, open/close)
- Props for all data and callbacks
- No Zustand stores needed

**Exception:** Modal might need a context provider for nested modals (future enhancement, not in MVP).

---

## INTEGRATION POINTS

### Existing Components to Update

**1. Layout Component** (`src/frontend/src/components/common/Layout.tsx`)
- Update navigation colors (active: `#5F6F7A`, inactive: `#4A4A4A`)
- Apply new typography (Heading/Body)
- Update button styles to use new Button component

**2. Assessment Cards** (various pages)
- Replace existing card styles with new Card component
- Update button styles to use new Button component
- Apply new typography

**3. Forms** (login, registration, etc.)
- Replace input styles with new Input component
- Update button styles to use new Button component
- Apply new typography

**4. VideoRecorder Components**
- Update button styles (RecordingControls, VideoPreview)
- Update error display colors
- Apply new typography

**5. Navigation**
- Update menu item colors
- Apply active state styling (`#5F6F7A` with border-bottom for tabs)

---

## MIGRATION STRATEGY

### Phase 1: Design Tokens (Week 1)
1. Update `tailwind.config.js` with new design tokens
2. Keep existing `primary` colors for backward compatibility
3. Test that existing styles still work

### Phase 2: Core Components (Week 1-2)
1. Create Button component
2. Create Card component
3. Create Typography components
4. Create Input component
5. Create Modal component
6. Write unit tests for each component

### Phase 3: Update Existing Components (Week 2-3)
1. **Priority 1:** Buttons (replace `.btn-primary`, `.btn-secondary`)
2. **Priority 2:** Cards (replace `.card` class)
3. **Priority 3:** Forms (replace `.input` class)
4. **Priority 4:** Navigation (update colors and typography)

### Phase 4: Remove Legacy Styles (Week 3-4)
1. Remove old `.btn-primary`, `.btn-secondary`, `.btn-danger` from `index.css`
2. Remove old `.card` styles
3. Remove old `.input` styles
4. Update all components to use new design system
5. Final accessibility audit

**Backward Compatibility:**
- Keep old classes in `index.css` during migration
- Gradually replace old classes with new components
- Remove old classes only after 100% migration

---

## DEPENDENCIES

### Existing Dependencies (No New Dependencies Required)

✅ **Already Installed:**
- `@heroicons/react` - For icons (already in package.json)
- `tailwindcss` - For styling (already in package.json)
- `react` - Framework (already in package.json)
- `typescript` - Type safety (already in package.json)

### Optional Dependencies (Future Enhancements)

- `@headlessui/react` - For accessible modal/dialog (already installed, can use for Modal)
- `clsx` - For conditional classes (already installed)
- `tailwind-merge` - For merging Tailwind classes (already installed)

**No new npm packages required for MVP.**

---

## TESTING STRATEGY

### Unit Tests

**Files to Test:**
- `Button.test.tsx` - Test all variants, states, accessibility
- `Card.test.tsx` - Test rendering, padding variants
- `Typography.test.tsx` - Test heading levels, body sizes
- `Input.test.tsx` - Test validation states, accessibility
- `Modal.test.tsx` - Test open/close, focus trap, accessibility

**Testing Library:** Jest + React Testing Library (already installed)

**Coverage Target:** 80% for design system components

### Visual Regression Tests

**Tool:** Playwright (already installed)

**Scenarios:**
- Button variants and states
- Card component in different contexts
- Input validation states
- Modal open/close animations
- Responsive design (mobile/desktop)

### Accessibility Tests

**Tool:** Jest + @testing-library/jest-dom (already installed)

**Checks:**
- Focus states visible
- ARIA labels present
- Keyboard navigation works
- Screen reader compatibility
- Color contrast (WCAG AA)

---

## FILE CHANGES SUMMARY

### New Files

```
src/frontend/src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   └── Button.test.tsx
├── Card/
│   ├── Card.tsx
│   ├── Card.types.ts
│   └── Card.test.tsx
├── Typography/
│   ├── Heading.tsx
│   ├── Body.tsx
│   └── Typography.types.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.types.ts
│   └── Input.test.tsx
└── Modal/
    ├── Modal.tsx
    ├── Modal.types.ts
    └── Modal.test.tsx
```

### Modified Files

```
src/frontend/
├── tailwind.config.js          # Add design tokens
├── src/styles/index.css        # Remove legacy classes (after migration)
└── src/components/
    ├── common/Layout.tsx       # Update to use new components
    └── [various pages]        # Update to use new components
```

---

## ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)

### Color Contrast

**Minimum Ratios:**
- Text: 4.5:1 (normal text), 3:1 (large text)
- UI Components: 3:1 (buttons, inputs)

**Colors to Verify:**
- `#5F6F7A` on `#FFFFFF` (accent button) ✅
- `#4A4A4A` on `#FFFFFF` (body text) ✅
- `#1C1C1C` on `#FFFFFF` (heading text) ✅
- `#DC2626` on `#FFFFFF` (error text) ✅

### Focus States

**Requirement:** All interactive elements must have visible focus indicators

**Implementation:**
- Ring `2px solid #5F6F7A` for all buttons/inputs
- Outline: none (replaced by ring)
- Keyboard navigation support

### Keyboard Navigation

**Requirements:**
- Tab order logical
- Enter/Space activate buttons
- ESC closes modals
- Focus trap in modals

---

## PERFORMANCE CONSIDERATIONS

### Bundle Size

**Impact:** Minimal
- New components are small (presentational)
- No new dependencies
- Tree-shaking will remove unused components

### Runtime Performance

**Optimizations:**
- Use `React.memo` for Card component (static content)
- Avoid unnecessary re-renders in Button (use `useCallback` for callbacks)
- Lazy load Modal component if not always visible

---

## ROLLBACK PLAN

**If Issues Arise:**

1. **Design Tokens:** Revert `tailwind.config.js` to previous version
2. **Components:** Keep old classes in `index.css` during migration
3. **Gradual Rollback:** Revert one component at a time if needed

**Migration Period:** 2-4 weeks (allows for gradual adoption and testing)

---

## SUCCESS METRICS

### Technical Metrics

- ✅ All components pass unit tests (80% coverage)
- ✅ All components pass accessibility tests (WCAG AA)
- ✅ No visual regressions in Playwright tests
- ✅ Bundle size increase < 10KB

### UX Metrics

- ✅ Consistent styling across all pages
- ✅ All buttons follow 3 variants (Primary/Secondary/Text)
- ✅ All cards use unified Card component
- ✅ All forms use unified Input component
- ✅ Focus states visible on all interactive elements

---

## NEXT STEPS

1. ✅ Technical plan created
2. ⏭️ Use `/tasks` to break down into implementation tasks
3. ⏭️ Use `/implement` to start implementation
4. ⏭️ Use `/qa` for QA testing after implementation

---

**Последнее обновление:** 2026-01-06

