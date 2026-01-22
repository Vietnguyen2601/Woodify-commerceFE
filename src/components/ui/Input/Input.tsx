import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const inputWrapper = tv({
  base: 'flex flex-col gap-1',
  variants: {
    fullWidth: {
      true: 'w-full',
    },
  },
})

const inputContainer = tv({
  base: 'relative flex items-center',
  variants: {
    hasError: {
      true: '',
    },
    hasLeft: {
      true: '',
    },
    hasRight: {
      true: '',
    },
  },
})

const inputField = tv({
  base: [
    'w-full h-10 px-3 text-sm',
    'text-neutral-900 bg-white',
    'border border-neutral-200 rounded-lg',
    'transition-all duration-150',
    'placeholder:text-neutral-400',
    'hover:border-neutral-300',
    'focus:outline-none focus:border-primary-500 focus:ring-[3px] focus:ring-primary-500/15',
    'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70',
  ],
  variants: {
    hasError: {
      true: 'border-error-500 focus:ring-error-500/15',
    },
    hasLeft: {
      true: 'pl-10',
    },
    hasRight: {
      true: 'pr-10',
    },
  },
})

const inputElement = tv({
  base: 'absolute flex items-center justify-center text-neutral-400 pointer-events-none',
  variants: {
    position: {
      left: 'left-3',
      right: 'right-3',
    },
  },
})

const inputLabel = tv({
  base: 'text-sm font-medium text-neutral-900',
})

const inputHelperText = tv({
  base: 'text-xs',
  variants: {
    type: {
      error: 'text-error-500',
      hint: 'text-neutral-600',
    },
  },
})

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputWrapper> {
  label?: string
  error?: string
  hint?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = Boolean(error)
    const hasLeft = Boolean(leftElement)
    const hasRight = Boolean(rightElement)

    return (
      <div className={inputWrapper({ fullWidth, className })}>
        {label && (
          <label htmlFor={inputId} className={inputLabel()}>
            {label}
          </label>
        )}
        <div className={inputContainer({ hasError, hasLeft, hasRight })}>
          {leftElement && (
            <span className={inputElement({ position: 'left' })}>
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputField({ hasError, hasLeft, hasRight })}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightElement && (
            <span className={inputElement({ position: 'right' })}>
              {rightElement}
            </span>
          )}
        </div>
        {error && (
          <span
            id={`${inputId}-error`}
            className={inputHelperText({ type: 'error' })}
            role="alert"
          >
            {error}
          </span>
        )}
        {hint && !error && (
          <span
            id={`${inputId}-hint`}
            className={inputHelperText({ type: 'hint' })}
          >
            {hint}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
