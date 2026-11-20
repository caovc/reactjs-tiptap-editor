// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/select.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import * as React from 'react';
import { isValidElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Create a Context for `indicatorPosition` and `indicator` control
const SelectContext = React.createContext<{
  indicatorPosition: 'left' | 'right';
  indicatorVisibility: boolean;
  indicator: ReactNode;
}>({ indicatorPosition: 'left', indicator: null, indicatorVisibility: true });

// Root Component
const Select = ({
  indicatorPosition = 'left',
  indicatorVisibility = true,
  indicator,
  ...props
}: {
  indicatorPosition?: 'left' | 'right';
  indicatorVisibility?: boolean;
  indicator?: ReactNode;
} & React.ComponentProps<typeof SelectPrimitive.Root>) => {
  return (
    <SelectContext.Provider value={{ indicatorPosition, indicatorVisibility, indicator }}>
      <SelectPrimitive.Root {...props} />
    </SelectContext.Provider>
  );
};

const SelectGroup = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Group>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Group>, 'ref'>
>(function SelectGroup({ ...props }, ref) {
  return <SelectPrimitive.Group ref={ref} data-slot='select-group' {...props} />;
});

const SelectValue = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Value>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Value>, 'ref'>
>(function SelectValue({ ...props }, ref) {
  return <SelectPrimitive.Value ref={ref} data-slot='select-value' {...props} />;
});

// Define size variants for SelectTrigger
const selectTriggerVariants = cva(
  'richtext-flex richtext-bg-background richtext-w-full richtext-items-center richtext-justify-between richtext-outline-none richtext-border richtext-border-input richtext-shadow-sm richtext-shadow-black/5 richtext-transition-shadow richtext-text-foreground data-placeholder:richtext-text-muted-foreground focus-visible:richtext-border-ring focus-visible:richtext-outline-none focus-visible:richtext-ring-[3px] focus-visible:richtext-ring-ring/30 disabled:richtext-cursor-not-allowed disabled:richtext-opacity-50 [&>span]:richtext-line-clamp-1 aria-invalid:richtext-border-destructive/60 aria-invalid:richtext-ring-destructive/10 dark:aria-invalid:richtext-border-destructive dark:aria-invalid:richtext-ring-destructive/20 [[data-invalid=true]_&]:richtext-border-destructive/60 [[data-invalid=true]_&]:richtext-ring-destructive/10 dark:[[data-invalid=true]_&]:richtext-border-destructive dark:[[data-invalid=true]_&]:richtext-ring-destructive/20',
  {
    variants: {
      size: {
        xs: 'richtext-h-7 richtext-px-2 richtext-text-xs richtext-gap-1 richtext-rounded-md',
        sm: 'richtext-h-8 richtext-px-2.5 richtext-text-xs richtext-gap-1 richtext-rounded-md',
        md: 'richtext-h-9 richtext-px-3 richtext-text-sm richtext-gap-1 richtext-rounded-md',
        lg: 'richtext-h-10 richtext-px-4 richtext-text-sm richtext-gap-1.5 richtext-rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SelectTriggerProps
  extends
    React.ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  Omit<SelectTriggerProps, 'ref'>
>(function SelectTrigger({ className, children, size, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot='select-trigger'
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className='-richtext-me-0.5 richtext-h-4 richtext-w-4 richtext-opacity-60' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  Omit<React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>, 'ref'>
>(function SelectScrollUpButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot='select-scroll-up-button'
      className={cn(
        'richtext-flex richtext-cursor-default richtext-items-center richtext-justify-center richtext-py-1',
        className
      )}
      {...props}
    >
      <ChevronUp className='richtext-h-4 richtext-w-4' />
    </SelectPrimitive.ScrollUpButton>
  );
});

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  Omit<React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>, 'ref'>
>(function SelectScrollDownButton({ className, ...props }, ref) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot='select-scroll-down-button'
      className={cn(
        'richtext-flex richtext-cursor-default richtext-items-center richtext-justify-center richtext-py-1',
        className
      )}
      {...props}
    >
      <ChevronDown className='richtext-h-4 richtext-w-4' />
    </SelectPrimitive.ScrollDownButton>
  );
});

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Content>, 'ref'>
>(function SelectContent({ className, children, position = 'popper', ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-richtext-portal
        data-slot='select-content'
        className={cn(
          'richtext-relative richtext-z-50 richtext-max-h-96 richtext-min-w-[8rem] richtext-overflow-hidden richtext-rounded-md richtext-border richtext-border-border richtext-bg-popover richtext-text-secondary-foreground richtext-shadow-md richtext-shadow-black/5 data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0 data-[state=closed]:richtext-zoom-out-95 data-[state=open]:richtext-zoom-in-95 data-[side=bottom]:richtext-slide-in-from-top-2 data-[side=left]:richtext-slide-in-from-right-2 data-[side=right]:richtext-slide-in-from-left-2 data-[side=top]:richtext-slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:richtext-translate-y-1.5 data-[side=left]:-richtext-translate-x-1.5 data-[side=right]:richtext-translate-x-1.5 data-[side=top]:-richtext-translate-y-1.5',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'richtext-p-1.5',
            position === 'popper' &&
              'richtext-h-[var(--radix-select-trigger-height)] richtext-w-full richtext-min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Label>, 'ref'>
>(function SelectLabel({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot='select-label'
      className={cn(
        'richtext-py-1.5 richtext-pe-2 richtext-ps-8 richtext-text-xs richtext-font-medium richtext-text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Item>, 'ref'>
>(function SelectItem({ className, children, ...props }, ref) {
  const { indicatorPosition, indicatorVisibility, indicator } = React.useContext(SelectContext);

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot='select-item'
      className={cn(
        'data-disabled:richtext-pointer-events-none data-disabled:richtext-opacity-50 richtext-relative richtext-flex richtext-w-full richtext-cursor-default richtext-select-none richtext-items-center richtext-rounded-sm richtext-py-1.5 richtext-text-sm richtext-text-foreground richtext-outline-none hover:richtext-bg-accent focus:richtext-bg-accent',
        indicatorPosition === 'left'
          ? 'richtext-pe-2 richtext-ps-8'
          : 'richtext-pe-8 richtext-ps-2',
        className
      )}
      {...props}
    >
      {indicatorVisibility &&
        (indicator && isValidElement(indicator) ? (
          indicator
        ) : (
          <span
            className={cn(
              'richtext-absolute richtext-flex richtext-h-3.5 richtext-w-3.5 richtext-items-center richtext-justify-center',
              indicatorPosition === 'left' ? 'start-2' : 'end-2'
            )}
          >
            <SelectPrimitive.ItemIndicator>
              <Check className='richtext-h-4 richtext-w-4 richtext-text-primary' />
            </SelectPrimitive.ItemIndicator>
          </span>
        ))}
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

function SelectIndicator({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ItemIndicator>) {
  const { indicatorPosition } = React.useContext(SelectContext);

  return (
    <span
      data-slot='select-indicator'
      className={cn(
        'richtext-absolute richtext-top-1/2 richtext-flex -richtext-translate-y-1/2 richtext-items-center richtext-justify-center',
        indicatorPosition === 'left' ? 'start-2' : 'end-2',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>{children}</SelectPrimitive.ItemIndicator>
    </span>
  );
}

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  Omit<React.ComponentProps<typeof SelectPrimitive.Separator>, 'ref'>
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot='select-separator'
      className={cn('-richtext-mx-1.5 richtext-my-1.5 richtext-h-px richtext-bg-border', className)}
      {...props}
    />
  );
});

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectIndicator,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
