import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <p>Card content</p>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders as div by default', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card?.tagName).toBe('DIV');
    });
  });

  describe('Padding Variants', () => {
    it('renders small padding correctly', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-4'); // 16px
    });

    it('renders medium padding correctly (default)', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6'); // 24px
    });

    it('renders large padding correctly', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-8'); // 32px
    });
  });

  describe('Styling', () => {
    it('has correct base styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass(
        'bg-background-primary',
        'border',
        'border-text-divider',
        'rounded-lg'
      );
    });

    it('does not have shadow (medical style = flat design)', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      // Check that shadow classes are not present
      expect(card).not.toHaveClass(/shadow/);
    });
  });

  describe('Clickable Card', () => {
    it('renders as button when onClick is provided', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card onClick={handleClick}>Clickable Card</Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card?.tagName).toBe('BUTTON');
    });

    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      const card = screen.getByRole('button', { name: /clickable card/i });

      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor-pointer class when clickable', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card onClick={handleClick}>Clickable Card</Card>
      );
      const card = container.firstChild;
      expect(card).toHaveClass('cursor-pointer', 'hover:border-accent-primary');
    });

    it('supports keyboard navigation (Enter key)', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      const card = screen.getByRole('button', { name: /clickable card/i });

      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation (Space key)', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      const card = screen.getByRole('button', { name: /clickable card/i });

      fireEvent.keyDown(card, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has proper accessibility attributes when clickable', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      const card = screen.getByRole('button', { name: /clickable card/i });

      expect(card).toHaveAttribute('type', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Non-clickable Card', () => {
    it('does not have cursor-pointer class when not clickable', () => {
      const { container } = render(<Card>Non-clickable Card</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('does not respond to clicks when onClick is not provided', () => {
      const { container } = render(<Card>Non-clickable Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card?.tagName).toBe('DIV');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-background-primary'); // Still has base classes
    });
  });

  describe('Default props', () => {
    it('defaults to medium padding', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6'); // 24px (medium)
    });
  });
});

