/**
 * Authentication form validation utilities
 * Implements security policies from docs/security/policies.md
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password according to security policy:
 * - Minimum 8 characters (matches backend requirement)
 * - Contains uppercase letters
 * - Contains lowercase letters
 * - Contains numbers
 * - Contains special characters
 * 
 * Note: Backend requires minimum 8 characters, but we encourage stronger passwords
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Calculate strength
  if (errors.length === 0) {
    const complexityScore =
      (password.length >= 16 ? 1 : 0) +
      (password.length >= 20 ? 1 : 0) +
      (/[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

    if (complexityScore >= 4) {
      strength = 'strong';
    } else if (complexityScore >= 3) {
      strength = 'medium';
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validates email format and checks against disposable email domains
 * Note: Full disposable email blocking is done on backend,
 * this is client-side validation for UX
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Client-side check for common disposable email domains
  // Full blocklist is enforced on backend
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'maildrop.cc',
    'yopmail.com',
    'trashmail.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return {
      valid: false,
      error: 'Temporary email addresses are not allowed',
    };
  }

  return {
    valid: true,
  };
}

/**
 * Gets password requirements text for UI
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters',
    'Contains uppercase and lowercase letters',
    'Contains at least one number',
    'Contains at least one special character',
  ];
}
