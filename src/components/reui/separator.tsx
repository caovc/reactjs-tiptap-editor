// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/separator.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { Separator as SeparatorPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  Omit<React.ComponentProps<typeof SeparatorPrimitive.Root>, 'ref'>
>(function Separator({ className, orientation = 'horizontal', decorative = true, ...props }, ref) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot='separator'
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'richtext-shrink-0 richtext-bg-border',
        orientation === 'horizontal'
          ? 'richtext-h-px richtext-w-full'
          : 'richtext-h-full richtext-w-px',
        className
      )}
      {...props}
    />
  );
});

export { Separator };
