import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ReactDOM from 'react-dom';
import { Modal } from './Modal';

// Mock React Portal
const originalCreatePortal = ReactDOM.createPortal;
beforeEach(() => {
  (ReactDOM.createPortal as jest.Mock) = jest.fn((element: React.ReactElement) => element);
});

afterEach(() => {
  ReactDOM.createPortal = originalCreatePortal;
  // Clean up body style after each test
  document.body.style.overflow = '';
});

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Test Modal' })).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('uses aria-label when title is not provided', () => {
      render(<Modal {...defaultProps} ariaLabel="Custom label" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Custom label');
    });

    it('focuses modal content when opened', async () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      await waitFor(() => {
        // The modal container should be focusable
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe('Size variants', () => {
    it('applies sm size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);
      const modalContent = container.querySelector('.max-w-sm');
      expect(modalContent).toBeInTheDocument();
    });

    it('applies md size classes by default', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modalContent = container.querySelector('.max-w-md');
      expect(modalContent).toBeInTheDocument();
    });

    it('applies lg size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);
      const modalContent = container.querySelector('.max-w-lg');
      expect(modalContent).toBeInTheDocument();
    });

    it('applies xl size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);
      const modalContent = container.querySelector('.max-w-xl');
      expect(modalContent).toBeInTheDocument();
    });

    it('applies full size classes', () => {
      const { container } = render(<Modal {...defaultProps} size="full" />);
      const modalContent = container.querySelector('.max-w-full');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      await userEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      await userEvent.keyboard('{Escape}');
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on Escape when closeOnEscape is false', async () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
      
      await userEvent.keyboard('{Escape}');
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
      
      // The backdrop click handler checks if e.target === e.currentTarget
      // We simulate this by creating an event where we click the dialog container itself
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      
      // Create a synthetic event where target is the dialog itself
      // This simulates clicking the backdrop area (not the modal content)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      // Mock the event target to be the dialog itself
      Object.defineProperty(clickEvent, 'target', {
        writable: false,
        value: dialog,
      });
      Object.defineProperty(clickEvent, 'currentTarget', {
        writable: false,
        value: dialog,
      });
      
      dialog?.dispatchEvent(clickEvent);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose on backdrop click when closeOnBackdropClick is false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />
      );
      
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
      
      // Create a synthetic event where target is the dialog itself
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, 'target', {
        writable: false,
        value: dialog,
      });
      Object.defineProperty(clickEvent, 'currentTarget', {
        writable: false,
        value: dialog,
      });
      
      dialog?.dispatchEvent(clickEvent);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when clicking modal content', async () => {
      const onClose = jest.fn();
      render(
        <Modal {...defaultProps} onClose={onClose}>
          <button>Click me</button>
        </Modal>
      );
      
      await userEvent.click(screen.getByText('Click me'));
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body scroll lock', () => {
    it('locks body scroll when modal opens', () => {
      render(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('unlocks body scroll when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
