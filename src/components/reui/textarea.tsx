// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/textarea.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Define input size variants
const textareaVariants = cva(
  'richtext-w-full richtext-bg-background richtext-border richtext-border-input richtext-bg-background richtext-text-foreground richtext-shadow-sm richtext-shadow-black/5 richtext-transition-[color,box-shadow] richtext-text-foreground placeholder:richtext-text-muted-foreground/80 focus-visible:richtext-border-ring focus-visible:richtext-outline-none focus-visible:richtext-ring-[3px] focus-visible:richtext-ring-ring/30 disabled:richtext-cursor-not-allowed disabled:richtext-opacity-50 [&[readonly]]:richtext-opacity-70 aria-[invalid=true]:richtext-border-destructive aria-[invalid=true]:richtext-border-destructive/60 aria-[invalid=true]:richtext-ring-destructive/10 dark:aria-[invalid=true]:richtext-border-destructive dark:aria-[invalid=true]:richtext-ring-destructive/20',
  {
    variants: {
      variant: {
        sm: 'richtext-px-2.5 richtext-py-2.5 richtext-text-xs richtext-rounded-md',
        md: 'richtext-px-3 richtext-py-3 richtext-text-sm richtext-rounded-md',
        lg: 'richtext-px-4 richtext-py-4 richtext-text-sm richtext-rounded-md',
      },
    },
    defaultVariants: {
      variant: 'md',
    },
  }
);

const Textarea = React.forwardRef<
  React.ComponentRef<'textarea'>,
  Omit<React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>, 'ref'>
>(function Textarea({ className, variant, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot='textarea'
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
});

export { Textarea, textareaVariants };
