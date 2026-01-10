import { forwardRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ButtonProps } from './Button.types';
import { clsx } from 'clsx';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Base classes for all buttons
    const baseClasses = clsx(
      'inline-flex items-center justify-center',
      'font-medium',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Size variants
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      }
    );

    // Variant-specific classes
    const variantClasses = clsx({
      // Primary variant
      'bg-accent-primary text-white rounded-lg hover:opacity-90 active:opacity-80':
        variant === 'primary',
      // Secondary variant
      'bg-transparent border border-accent-primary text-accent-primary rounded-lg hover:opacity-90 active:opacity-80':
        variant === 'secondary',
      // Text variant
      'bg-transparent text-accent-primary hover:opacity-90 active:opacity-80':
        variant === 'text',
    });

    // Spinner icon (16px, color matches button text color)
    const spinnerColorClass =
      variant === 'primary' ? 'text-white' : 'text-accent-primary';

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={clsx(baseClasses, variantClasses, className)}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <ArrowPathIcon
              className={clsx('h-4 w-4 animate-spin', spinnerColorClass)}
              aria-hidden="true"
            />
            <span className="sr-only">Loading</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={clsx('mr-2', size === 'sm' && 'mr-1.5')}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={clsx('ml-2', size === 'sm' && 'ml-1.5')}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';



