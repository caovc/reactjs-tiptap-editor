import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/alert.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'richtext-flex richtext-items-stretch richtext-w-full richtext-gap-2 group-[.richtext-toaster]:richtext-w-[var(--width)]',
  {
    variants: {
      variant: {
        secondary: '',
        primary: '',
        destructive: '',
        success: '',
        info: '',
        mono: '',
        warning: '',
      },
      icon: {
        primary: '',
        destructive: '',
        success: '',
        info: '',
        warning: '',
      },
      appearance: {
        solid: '',
        outline: '',
        light: '',
        stroke: 'richtext-text-foreground',
      },
      size: {
        lg: 'richtext-rounded-lg richtext-p-4 richtext-gap-3 richtext-text-base [&>[data-slot=alert-icon]>svg]:richtext-size-6 [&>[data-slot=alert-icon]]:richtext-mt-0.5 [&_[data-slot=alert-close]]:richtext-mt-1',
        md: 'richtext-rounded-lg richtext-p-3.5 richtext-gap-2.5 richtext-text-sm [&>[data-slot=alert-icon]>svg]:richtext-size-5 [&>[data-slot=alert-icon]]:richtext-mt-0 [&_[data-slot=alert-close]]:richtext-mt-0.5',
        sm: 'richtext-rounded-md richtext-px-3 richtext-py-2.5 richtext-gap-2 richtext-text-xs [&>[data-slot=alert-icon]>svg]:richtext-size-4 [&>[data-slot=alert-icon]]:richtext-mt-0.5 [&_[data-slot=alert-close]]:richtext-mt-0.25 [&_[data-slot=alert-close]_svg]:richtext-size-3.5',
      },
    },
    compoundVariants: [
      /* Solid */
      {
        variant: 'secondary',
        appearance: 'solid',
        className: 'richtext-bg-muted richtext-text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'solid',
        className: 'richtext-bg-primary richtext-text-primary-foreground',
      },
      {
        variant: 'destructive',
        appearance: 'solid',
        className: 'richtext-bg-destructive richtext-text-destructive-foreground',
      },
      {
        variant: 'success',
        appearance: 'solid',
        className:
          'richtext-bg-[var(--color-success,var(--color-green-500))] richtext-text-[var(--color-success-foreground,var(--color-white))]',
      },
      {
        variant: 'info',
        appearance: 'solid',
        className:
          'richtext-bg-[var(--color-info,var(--color-violet-600))] richtext-text-[var(--color-info-foreground,var(--color-white))]',
      },
      {
        variant: 'warning',
        appearance: 'solid',
        className:
          'richtext-bg-[var(--color-warning,var(--color-yellow-500))] richtext-text-[var(--color-warning-foreground,var(--color-white))]',
      },
      {
        variant: 'mono',
        appearance: 'solid',
        className:
          'richtext-bg-zinc-950 richtext-text-white dark:richtext-bg-zinc-300 dark:richtext-text-black [&>[data-slot=alert-close]]:richtext-text-white',
      },

      /* Outline */
      {
        variant: 'secondary',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-foreground [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-primary [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'destructive',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-destructive [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'success',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-[var(--color-success,var(--color-green-500))] [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'info',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-[var(--color-info,var(--color-violet-600))] [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'warning',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-[var(--color-warning,var(--color-yellow-500))] [&_[data-slot=alert-close]]:richtext-text-foreground',
      },
      {
        variant: 'mono',
        appearance: 'outline',
        className:
          'richtext-border richtext-border-border richtext-bg-background richtext-text-foreground [&_[data-slot=alert-close]]:richtext-text-foreground',
      },

      /* Light */
      {
        variant: 'secondary',
        appearance: 'light',
        className:
          'richtext-bg-muted richtext-border richtext-border-border richtext-text-foreground',
      },
      {
        variant: 'primary',
        appearance: 'light',
        className:
          'richtext-text-foreground richtext-bg-[var(--color-primary-soft,var(--color-blue-50))] richtext-border richtext-border-[var(--color-primary-alpha,var(--color-blue-100))] [&_[data-slot=alert-icon]]:richtext-text-primary dark:richtext-bg-[var(--color-primary-soft,var(--color-blue-950))] dark:richtext-border-[var(--color-primary-alpha,var(--color-blue-900))]',
      },
      {
        variant: 'destructive',
        appearance: 'light',
        className:
          'richtext-bg-[var(--color-destructive-soft,var(--color-red-50))] richtext-border richtext-border-[var(--color-destructive-alpha,var(--color-red-100))] richtext-text-foreground [&_[data-slot=alert-icon]]:richtext-text-destructive dark:richtext-bg-[var(--color-destructive-soft,var(--color-red-950))] dark:richtext-border-[var(--color-destructive-alpha,var(--color-red-900))]',
      },
      {
        variant: 'success',
        appearance: 'light',
        className:
          'richtext-bg-[var(--color-success-soft,var(--color-green-50))] richtext-border richtext-border-[var(--color-success-alpha,var(--color-green-200))] richtext-text-foreground [&_[data-slot=alert-icon]]:richtext-text-[var(--color-success-foreground,var(--color-green-600))] dark:richtext-bg-[var(--color-success-soft,var(--color-green-950))] dark:richtext-border-[var(--color-success-alpha,var(--color-green-900))]',
      },
      {
        variant: 'info',
        appearance: 'light',
        className:
          'richtext-bg-[var(--color-info-soft,var(--color-violet-50))] richtext-border richtext-border-[var(--color-info-alpha,var(--color-violet-100))] richtext-text-foreground [&_[data-slot=alert-icon]]:richtext-text-[var(--color-info-foreground,var(--color-violet-600))] dark:richtext-bg-[var(--color-info-soft,var(--color-violet-950))] dark:richtext-border-[var(--color-info-alpha,var(--color-violet-900))]',
      },
      {
        variant: 'warning',
        appearance: 'light',
        className:
          'richtext-bg-[var(--color-warning-soft,var(--color-yellow-50))] richtext-border richtext-border-[var(--color-warning-alpha,var(--color-yellow-200))] richtext-text-foreground [&_[data-slot=alert-icon]]:richtext-text-[var(--color-warning-foreground,var(--color-yellow-600))] dark:richtext-bg-[var(--color-warning-soft,var(--color-yellow-950))] dark:richtext-border-[var(--color-warning-alpha,var(--color-yellow-900))]',
      },

      /* Mono */
      {
        variant: 'mono',
        icon: 'primary',
        className: '[&_[data-slot=alert-icon]]:richtext-text-primary',
      },
      {
        variant: 'mono',
        icon: 'warning',
        className:
          '[&_[data-slot=alert-icon]]:richtext-text-[var(--color-warning-foreground,var(--color-yellow-600))]',
      },
      {
        variant: 'mono',
        icon: 'success',
        className:
          '[&_[data-slot=alert-icon]]:richtext-text-[var(--color-success-foreground,var(--color-green-600))]',
      },
      {
        variant: 'mono',
        icon: 'destructive',
        className: '[&_[data-slot=alert-icon]]:richtext-text-destructive',
      },
      {
        variant: 'mono',
        icon: 'info',
        className:
          '[&_[data-slot=alert-icon]]:richtext-text-[var(--color-info-foreground,var(--color-violet-600))]',
      },
    ],
    defaultVariants: {
      variant: 'secondary',
      appearance: 'solid',
      size: 'md',
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  close?: boolean;
  onClose?: () => void;
}

interface AlertIconProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({
  className,
  variant,
  size,
  icon,
  appearance,
  close = false,
  onClose,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(alertVariants({ variant, size, icon, appearance }), className)}
      {...props}
    >
      {children}
      {close && (
        <button
          onClick={onClose}
          aria-label='Dismiss'
          data-slot='alert-close'
          className={cn('richtext-group richtext-size-4 richtext-shrink-0 richtext-cursor-pointer')}
        >
          <X className='richtext-size-4 richtext-opacity-60 group-hover:richtext-opacity-100' />
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div
      data-slot='alert-title'
      className={cn('richtext-grow richtext-tracking-tight', className)}
      {...props}
    />
  );
}

function AlertIcon({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot='alert-icon' className={cn('richtext-shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

function AlertToolbar({ children, className, ...props }: AlertIconProps) {
  return (
    <div data-slot='alert-toolbar' className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'richtext-text-sm [&_p]:richtext-mb-2 [&_p]:richtext-leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot='alert-content'
      className={cn(
        'richtext-space-y-2 [&_[data-slot=alert-title]]:richtext-font-semibold',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle, AlertToolbar };
