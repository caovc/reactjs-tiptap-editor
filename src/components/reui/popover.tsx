// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/popover.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { Popover as PopoverPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

const PopoverTrigger = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Trigger>,
  Omit<React.ComponentProps<typeof PopoverPrimitive.Trigger>, 'ref'>
>(function PopoverTrigger({ ...props }, ref) {
  return <PopoverPrimitive.Trigger ref={ref} data-slot='popover-trigger' {...props} />;
});

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  Omit<React.ComponentProps<typeof PopoverPrimitive.Content>, 'ref'>
>(function PopoverContent({ className, align = 'center', sideOffset = 4, ...props }, ref) {
  return (
    <PopoverPrimitive.PopoverPortal>
      <PopoverPrimitive.Content
        ref={ref}
        data-richtext-portal
        data-slot='popover-content'
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'richtext-z-50 richtext-w-72 richtext-rounded-md richtext-border richtext-border-border richtext-bg-popover richtext-p-4 richtext-text-popover-foreground richtext-shadow-md richtext-shadow-black/5 richtext-outline-none data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0 data-[state=closed]:richtext-zoom-out-95 data-[state=open]:richtext-zoom-in-95 data-[side=bottom]:richtext-slide-in-from-top-2 data-[side=left]:richtext-slide-in-from-right-2 data-[side=right]:richtext-slide-in-from-left-2 data-[side=top]:richtext-slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.PopoverPortal>
  );
});

const PopoverAnchor = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Anchor>,
  Omit<React.ComponentProps<typeof PopoverPrimitive.Anchor>, 'ref'>
>(function PopoverAnchor({ ...props }, ref) {
  return <PopoverPrimitive.Anchor ref={ref} data-slot='popover-anchor' {...props} />;
});

export { Popover, PopoverContent, PopoverTrigger, PopoverAnchor };
