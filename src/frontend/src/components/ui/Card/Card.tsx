import { CardProps } from './Card.types';
import { clsx } from 'clsx';

export function Card({
  children,
  padding = 'md',
  onClick,
  className,
  ...props
}: CardProps) {
  // Base classes for all cards
  const baseClasses = clsx(
    'bg-background-primary',
    'border border-text-divider',
    'rounded-lg',
    'transition-colors duration-200',
    {
      // Padding variants
      'p-4': padding === 'sm', // 16px
      'p-6': padding === 'md', // 24px
      'p-8': padding === 'lg', // 32px
    },
    {
      // Cursor pointer if clickable
      'cursor-pointer hover:border-accent-primary': onClick !== undefined,
    }
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(baseClasses, className)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={clsx(baseClasses, className)} {...props}>
      {children}
    </div>
  );
}

