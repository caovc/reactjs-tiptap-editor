// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/dropdown-menu.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { Check, ChevronRight, Circle } from 'lucide-react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />;
}

const DropdownMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Trigger>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>, 'ref'>
>(function DropdownMenuTrigger({ ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      className='richtext-select-none'
      data-slot='dropdown-menu-trigger'
      {...props}
    />
  );
});

const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
      inset?: boolean;
    },
    'ref'
  >
>(function DropdownMenuSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot='dropdown-menu-sub-trigger'
      className={cn(
        'richtext-flex richtext-cursor-default richtext-select-none richtext-items-center richtext-gap-2 richtext-rounded-md richtext-px-2 richtext-py-1.5 richtext-text-sm richtext-outline-none',
        'focus:richtext-bg-accent focus:richtext-text-foreground',
        'data-[state=open]:richtext-bg-accent data-[state=open]:richtext-text-foreground',
        'data-[here=true]:richtext-bg-accent data-[here=true]:richtext-text-foreground',
        '[&>svg]:richtext-pointer-events-none [&>svg]:richtext-size-4 [&>svg]:richtext-shrink-0 [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60',
        inset && 'richtext-ps-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight
        data-slot='dropdown-menu-sub-trigger-indicator'
        className='richtext-ms-auto !richtext-size-3.5 rtl:richtext-rotate-180'
      />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>, 'ref'>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      data-richtext-portal
      data-slot='dropdown-menu-sub-content'
      className={cn(
        'richtext-z-50 richtext-min-w-[8rem] richtext-space-y-0.5 richtext-overflow-hidden richtext-rounded-md richtext-border richtext-border-border richtext-bg-popover richtext-p-2 richtext-text-popover-foreground richtext-shadow-md richtext-shadow-black/5 data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0 data-[state=closed]:richtext-zoom-out-95 data-[state=open]:richtext-zoom-in-95 data-[side=bottom]:richtext-slide-in-from-top-2 data-[side=left]:richtext-slide-in-from-right-2 data-[side=right]:richtext-slide-in-from-left-2 data-[side=top]:richtext-slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
});

const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
      portalContainer?: HTMLElement | null;
    },
    'ref'
  >
>(function DropdownMenuContent({ className, sideOffset = 4, portalContainer, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal container={portalContainer}>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-richtext-portal
        data-slot='dropdown-menu-content'
        sideOffset={sideOffset}
        className={cn(
          'richtext-z-50 richtext-min-w-[8rem] richtext-space-y-0.5 richtext-overflow-hidden richtext-rounded-md richtext-border richtext-border-border richtext-bg-popover richtext-p-2 richtext-text-popover-foreground richtext-shadow-md richtext-shadow-black/5 data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0 data-[state=closed]:richtext-zoom-out-95 data-[state=open]:richtext-zoom-in-95 data-[side=bottom]:richtext-slide-in-from-top-2 data-[side=left]:richtext-slide-in-from-right-2 data-[side=right]:richtext-slide-in-from-left-2 data-[side=top]:richtext-slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const DropdownMenuGroup = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Group>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Group>, 'ref'>
>(function DropdownMenuGroup({ ...props }, ref) {
  return <DropdownMenuPrimitive.Group ref={ref} data-slot='dropdown-menu-group' {...props} />;
});

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
      inset?: boolean;
      variant?: 'destructive';
    },
    'ref'
  >
>(function DropdownMenuItem({ className, inset, variant, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot='dropdown-menu-item'
      className={cn(
        'richtext-relative richtext-flex richtext-cursor-default richtext-select-none richtext-items-center richtext-gap-2 richtext-rounded-md richtext-px-2 richtext-py-1.5 richtext-text-sm richtext-text-foreground richtext-outline-none richtext-transition-colors data-[disabled]:richtext-pointer-events-none data-[disabled]:richtext-opacity-50 [&_svg:not([class*=richtext-size-])]:richtext-size-4 [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 [&_svg]:richtext-pointer-events-none [&_svg]:richtext-shrink-0',
        'focus:richtext-bg-accent focus:richtext-text-foreground',
        'data-[active=true]:richtext-bg-accent data-[active=true]:richtext-text-accent-foreground',
        inset && 'richtext-ps-8',
        variant === 'destructive' &&
          'richtext-text-destructive hover:richtext-bg-destructive/5 hover:richtext-text-destructive focus:richtext-bg-destructive/5 focus:richtext-text-destructive data-[active=true]:richtext-bg-destructive/5',
        className
      )}
      {...props}
    />
  );
});

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>, 'ref'>
>(function DropdownMenuCheckboxItem({ className, children, checked, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot='dropdown-menu-checkbox-item'
      className={cn(
        'richtext-relative richtext-flex richtext-cursor-default richtext-select-none richtext-items-center richtext-rounded-md richtext-py-1.5 richtext-pe-2 richtext-ps-8 richtext-text-sm richtext-outline-none richtext-transition-colors focus:richtext-bg-accent focus:richtext-text-accent-foreground data-[disabled]:richtext-pointer-events-none data-[disabled]:richtext-opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className='richtext-absolute richtext-start-2 richtext-flex richtext-h-3.5 richtext-w-3.5 richtext-items-center richtext-justify-center richtext-text-muted-foreground'>
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className='richtext-h-4 richtext-w-4 richtext-text-primary' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>, 'ref'>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      data-slot='dropdown-menu-radio-item'
      className={cn(
        'richtext-relative richtext-flex richtext-cursor-default richtext-select-none richtext-items-center richtext-rounded-md richtext-py-1.5 richtext-pe-2 richtext-ps-6 richtext-text-sm richtext-outline-none richtext-transition-colors focus:richtext-bg-accent focus:richtext-text-accent-foreground data-[disabled]:richtext-pointer-events-none data-[disabled]:richtext-opacity-50',
        className
      )}
      {...props}
    >
      <span className='richtext-absolute richtext-start-1.5 richtext-flex richtext-h-3.5 richtext-w-3.5 richtext-items-center richtext-justify-center'>
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className='richtext-h-1.5 richtext-w-1.5 richtext-fill-primary richtext-stroke-primary' />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  Omit<
    React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
      inset?: boolean;
    },
    'ref'
  >
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot='dropdown-menu-label'
      className={cn(
        'richtext-px-2 richtext-py-1.5 richtext-text-xs richtext-font-medium richtext-text-muted-foreground',
        inset && 'richtext-ps-8',
        className
      )}
      {...props}
    />
  );
});

const DropdownMenuRadioGroup = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioGroup>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>, 'ref'>
>(function DropdownMenuRadioGroup({ ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioGroup ref={ref} data-slot='dropdown-menu-radio-group' {...props} />
  );
});

const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Separator>, 'ref'>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-slot='dropdown-menu-separator'
      className={cn('-richtext-mx-2 richtext-my-1.5 richtext-h-px richtext-bg-muted', className)}
      {...props}
    />
  );
});

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn(
        'richtext-ms-auto richtext-text-xs richtext-tracking-widest richtext-opacity-60',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot='dropdown-menu-sub' {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
