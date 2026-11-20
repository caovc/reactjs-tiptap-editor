// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/label.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Label as LabelPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'richtext-text-sm richtext-leading-none richtext-text-foreground peer-disabled:richtext-cursor-not-allowed peer-disabled:richtext-opacity-50',
  {
    variants: {
      variant: {
        primary: 'richtext-font-medium',
        secondary: 'richtext-font-normal',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  Omit<React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>, 'ref'>
>(function Label({ className, variant, ...props }, ref) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot='label'
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  );
});

export { Label };
