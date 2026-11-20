// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/tooltip.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  );
}

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Trigger>,
  Omit<React.ComponentProps<typeof TooltipPrimitive.Trigger>, 'ref'>
>(function TooltipTrigger({ ...props }, ref) {
  return <TooltipPrimitive.Trigger ref={ref} data-slot='tooltip-trigger' {...props} />;
});

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, 'ref'>
>(function TooltipContent({ className, sideOffset = 0, children, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-richtext-portal
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(
          'richtext-z-50 richtext-w-fit richtext-origin-[var(--radix-tooltip-content-transform-origin)] richtext-text-balance richtext-rounded-md richtext-bg-foreground richtext-px-3 richtext-py-1.5 richtext-text-xs richtext-text-background richtext-animate-in richtext-fade-in-0 richtext-zoom-in-95 data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=closed]:richtext-zoom-out-95 data-[side=bottom]:richtext-slide-in-from-top-2 data-[side=left]:richtext-slide-in-from-right-2 data-[side=right]:richtext-slide-in-from-left-2 data-[side=top]:richtext-slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className='richtext-z-50 richtext-size-2.5 richtext-translate-y-[calc(-50%_-_2px)] richtext-rotate-45 richtext-rounded-[2px] richtext-bg-foreground richtext-fill-foreground' />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
