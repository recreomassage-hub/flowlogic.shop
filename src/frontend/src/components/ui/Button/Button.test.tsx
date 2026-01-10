import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

describe('Button', () => {
  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass('bg-accent-primary', 'text-white', 'rounded-lg');
    });

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toHaveClass(
        'bg-transparent',
        'border',
        'border-accent-primary',
        'text-accent-primary',
        'rounded-lg'
      );
    });

    it('renders text variant correctly', () => {
      render(<Button variant="text">Text Button</Button>);
      const button = screen.getByRole('button', { name: /text button/i });
      expect(button).toHaveClass('bg-transparent', 'text-accent-primary');
      expect(button).not.toHaveClass('rounded-lg');
    });
  });

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button', { name: /small button/i });
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('renders medium size correctly (default)', () => {
      render(<Button>Medium Button</Button>);
      const button = screen.getByRole('button', { name: /medium button/i });
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('renders large size correctly', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('States', () => {
    it('renders disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders loading state correctly', () => {
      render(<Button isLoading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      // Check for spinner (loading icon)
      const loadingText = screen.getByText('Loading');
      expect(loadingText).toHaveClass('sr-only');
    });

    it('shows spinner when loading', () => {
      const { container } = render(<Button isLoading>Button</Button>);
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      render(
        <Button leftIcon={<ArrowRightIcon data-testid="left-icon" />}>
          Button with Icon
        </Button>
      );
      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders right icon correctly', () => {
      render(
        <Button rightIcon={<ArrowRightIcon data-testid="right-icon" />}>
          Button with Icon
        </Button>
      );
      const icon = screen.getByTestId('right-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders both icons correctly', () => {
      render(
        <Button
          leftIcon={<ArrowRightIcon data-testid="left-icon" />}
          rightIcon={<ArrowRightIcon data-testid="right-icon" />}
        >
          Button with Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button
          isLoading
          leftIcon={<ArrowRightIcon data-testid="left-icon" />}
          rightIcon={<ArrowRightIcon data-testid="right-icon" />}
        >
          Button
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus states', () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole('button', { name: /focusable button/i });
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-accent-primary');
    });

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      const button = screen.getByRole('button', { name: /keyboard button/i });
      
      fireEvent.keyDown(button, { key: 'Enter' });
      // Note: keyDown doesn't trigger onClick, but button should be focusable
      button.focus();
      expect(button).toHaveFocus();
    });

    it('has aria-busy when loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('has aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      const button = screen.getByRole('button', { name: /clickable button/i });
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const button = screen.getByRole('button', { name: /disabled button/i });
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Loading Button
        </Button>
      );
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-accent-primary'); // Still has variant classes
    });
  });

  describe('Default props', () => {
    it('defaults to primary variant', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toHaveClass('bg-accent-primary', 'text-white');
    });

    it('defaults to medium size', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });
  });
});



