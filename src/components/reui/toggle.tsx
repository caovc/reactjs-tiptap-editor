// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/toggle.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Toggle as TogglePrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'richtext-cursor-pointer richtext-inline-flex richtext-items-center richtext-justify-center richtext-rounded-md richtext-shrink-0 richtext-font-medium richtext-ring-offset-background richtext-transition-colors hover:richtext-bg-muted hover:richtext-text-muted-foreground focus-visible:richtext-outline-none focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 disabled:richtext-pointer-events-none disabled:richtext-opacity-50 data-[state=on]:richtext-bg-accent data-[state=on]:richtext-text-accent-foreground [&_svg]:richtext-pointer-events-none [&_svg]:richtext-shrink-0',
  {
    variants: {
      variant: {
        default: 'richtext-bg-transparent',
        outline:
          'richtext-border richtext-border-input richtext-bg-transparent hover:richtext-bg-accent hover:richtext-text-accent-foreground',
      },
      size: {
        lg: 'richtext-h-10 richtext-min-w-10 richtext-rounded-md richtext-px-2.5 richtext-text-sm richtext-gap-1.5 [&_svg]:richtext-size-4',
        md: 'richtext-h-8.5 richtext-min-w-8.5 richtext-rounded-md richtext-px-2 richtext-text-[0.8125rem] richtext-leading-5 richtext-gap-1 [&_svg]:richtext-size-4',
        sm: 'richtext-h-7 richtext-min-w-7 richtext-rounded-md richtext-px-1.25 richtext-text-xs richtext-gap-1 [&_svg]:richtext-size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  Omit<
    React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>,
    'ref'
  >
>(function Toggle({ className, variant, size, ...props }, ref) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot='toggle'
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
});

export { Toggle, toggleVariants };
