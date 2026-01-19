import { forwardRef } from 'react';
import { InputProps } from './Input.types';
import { clsx } from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      label,
      helperText,
      leftIcon,
      rightIcon,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided (for label association)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error && errorMessage ? `${inputId}-error` : undefined;

    // Base classes for all inputs
    const baseClasses = clsx(
      'w-full',
      'font-medium',
      'transition-all duration-200',
      'border rounded-lg',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-text-body/50',
      {
        // Size variants
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
      },
      {
        // Padding adjustment when icons present
        'pl-10': leftIcon && size === 'sm',
        'pl-11': leftIcon && size === 'md',
        'pl-12': leftIcon && size === 'lg',
        'pr-10': rightIcon && size === 'sm',
        'pr-11': rightIcon && size === 'md',
        'pr-12': rightIcon && size === 'lg',
      }
    );

    // Variant-specific classes
    const variantClasses = clsx({
      // Default state
      'bg-background-primary border-text-divider text-text-heading focus:ring-accent-primary':
        !error && !disabled,
      // Error state
      'bg-background-primary border-state-error text-text-heading focus:ring-state-error':
        error && !disabled,
      // Disabled state
      'bg-background-secondary border-text-divider text-text-body/50':
        disabled,
    });

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-2',
              {
                'text-text-heading': !error,
                'text-state-error': error,
                'text-text-body/50': disabled,
              }
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute left-0 top-0 bottom-0 flex items-center pointer-events-none',
                {
                  'pl-3': size === 'sm',
                  'pl-4': size === 'md',
                  'pl-6': size === 'lg',
                },
                {
                  'text-text-body': !error && !disabled,
                  'text-state-error': error && !disabled,
                  'text-text-body/50': disabled,
                }
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(baseClasses, variantClasses, className)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={clsx({
              [errorId || '']: error && errorMessage,
              [helperId || '']: helperText && !error,
            })}
            {...props}
          />

          {rightIcon && (
            <div
              className={clsx(
                'absolute right-0 top-0 bottom-0 flex items-center pointer-events-none',
                {
                  'pr-3': size === 'sm',
                  'pr-4': size === 'md',
                  'pr-6': size === 'lg',
                },
                {
                  'text-text-body': !error && !disabled,
                  'text-state-error': error && !disabled,
                  'text-text-body/50': disabled,
                }
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(errorMessage || helperText) && (
          <div
            id={error ? errorId : helperId}
            className={clsx('mt-2 text-sm', {
              'text-state-error': error,
              'text-text-body': !error,
            })}
            role={error ? 'alert' : undefined}
          >
            {error ? errorMessage : helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
