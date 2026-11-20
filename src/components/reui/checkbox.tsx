// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/checkbox.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Define the variants for the Checkbox using cva.
const checkboxVariants = cva(
  'richtext-group richtext-peer richtext-bg-background richtext-shrink-0 richtext-rounded-md richtext-border richtext-border-input richtext-ring-offset-background focus-visible:richtext-outline-none focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 disabled:richtext-cursor-not-allowed disabled:richtext-opacity-50 aria-invalid:richtext-border-destructive/60 aria-invalid:richtext-ring-destructive/10 dark:aria-invalid:richtext-border-destructive dark:aria-invalid:richtext-ring-destructive/20 [[data-invalid=true]_&]:richtext-border-destructive/60 [[data-invalid=true]_&]:richtext-ring-destructive/10 dark:[[data-invalid=true]_&]:richtext-border-destructive dark:[[data-invalid=true]_&]:richtext-ring-destructive/20, data-[state=checked]:richtext-bg-primary data-[state=checked]:richtext-border-primary data-[state=checked]:richtext-text-primary-foreground data-[state=indeterminate]:richtext-bg-primary data-[state=indeterminate]:richtext-border-primary data-[state=indeterminate]:richtext-text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'richtext-size-4.5 [&_svg]:richtext-size-3',
        md: 'richtext-size-5 [&_svg]:richtext-size-3.5',
        lg: 'richtext-size-5.5 [&_svg]:richtext-size-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>,
    'ref'
  >
>(function Checkbox({ className, size, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot='checkbox'
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          'richtext-flex richtext-items-center richtext-justify-center richtext-text-current'
        )}
      >
        <Check className='group-data-[state=indeterminate]:richtext-hidden' />
        <Minus className='richtext-hidden group-data-[state=indeterminate]:richtext-block' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };
