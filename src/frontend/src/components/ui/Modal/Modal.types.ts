import { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close (e.g., backdrop click, escape key, close button)
   */
  onClose: () => void;
  /**
   * Modal title (optional, but recommended for accessibility)
   */
  title?: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Size variant
   * @default 'md'
   */
  size?: ModalSize;
  /**
   * Whether to show close button
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether clicking backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;
  /**
   * Whether pressing Escape closes the modal
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Additional CSS classes for the modal container
   */
  className?: string;
  /**
   * Additional CSS classes for the modal content
   */
  contentClassName?: string;
  /**
   * ARIA label for the modal (for accessibility)
   * If not provided, will use title if available
   */
  ariaLabel?: string;
  /**
   * Custom footer content (e.g., action buttons)
   */
  footer?: ReactNode;
}
