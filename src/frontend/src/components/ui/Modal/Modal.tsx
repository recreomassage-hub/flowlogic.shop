import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ModalProps } from './Modal.types';
import { clsx } from 'clsx';

/**
 * Modal Component
 * 
 * A reusable modal/dialog component with:
 * - Accessibility support (ARIA attributes, focus management, keyboard navigation)
 * - Backdrop overlay
 * - Close on backdrop click or Escape key
 * - Size variants
 * - Portal rendering for proper z-index handling
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  ariaLabel,
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the modal when it opens
    const timer = setTimeout(() => {
      modalRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      // Restore focus to the previously focused element when modal closes
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Determine ARIA label
  const modalAriaLabel = ariaLabel || title || 'Modal dialog';

  // Size classes
  const sizeClasses = clsx({
    'max-w-sm': size === 'sm', // 384px
    'max-w-md': size === 'md', // 448px
    'max-w-lg': size === 'lg', // 512px
    'max-w-xl': size === 'xl', // 576px
    'max-w-full mx-4': size === 'full',
  });

  // Render modal using portal
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-label={!title ? modalAriaLabel : undefined}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={clsx(
          'relative z-10',
          'w-full',
          sizeClasses,
          'bg-background-primary',
          'rounded-lg',
          'shadow-xl',
          'focus:outline-none',
          'max-h-[90vh]',
          'flex flex-col',
          className
        )}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal content
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-text-divider">
            {title && (
              <h2
                id="modal-title"
                className="text-heading-lg text-text-heading font-semibold"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'ml-auto',
                  'p-2 -mr-2',
                  'text-text-body hover:text-text-heading',
                  'rounded-lg',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
                  'hover:bg-background-secondary'
                )}
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={clsx(
            'flex-1 overflow-y-auto',
            'p-6',
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-text-divider">{footer}</div>
        )}
      </div>
    </div>
  );

  // Render to portal (body)
  return createPortal(modalContent, document.body);
}
