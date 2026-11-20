// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/switch.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Switch as SwitchPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Define a context for `permanent` state
const SwitchContext = React.createContext<{ permanent: boolean }>({
  permanent: false,
});

const useSwitchContext = () => {
  const context = React.useContext(SwitchContext);
  if (!context) {
    throw new Error('SwitchIndicator must be used within a Switch component');
  }
  return context;
};

// Define classes for variants
const switchVariants = cva(
  'richtext-relative richtext-peer richtext-inline-flex richtext-shrink-0 richtext-cursor-pointer richtext-items-center richtext-rounded-full richtext-transition-colors focus-visible:richtext-outline-none focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 focus-visible:richtext-ring-offset-background disabled:richtext-cursor-not-allowed disabled:richtext-opacity-50 data-[state=unchecked]:richtext-bg-input aria-invalid:richtext-border aria-invalid:richtext-border-destructive/60 aria-invalid:richtext-ring-destructive/10 dark:aria-invalid:richtext-border-destructive dark:aria-invalid:richtext-ring-destructive/20 [[data-invalid=true]_&]:richtext-border [[data-invalid=true]_&]:richtext-border-destructive/60 [[data-invalid=true]_&]:richtext-ring-destructive/10 dark:[[data-invalid=true]_&]:richtext-border-destructive dark:[[data-invalid=true]_&]:richtext-ring-destructive/20',
  {
    variants: {
      shape: {
        pill: 'richtext-rounded-full',
        square: 'richtext-rounded-md',
      },
      size: {
        sm: 'richtext-h-5 richtext-w-8',
        md: 'richtext-h-6 richtext-w-10',
        lg: 'richtext-h-8 richtext-w-14',
        xl: 'richtext-h-9 richtext-w-16',
      },
      permanent: {
        true: 'richtext-bg-input',
        false: 'data-[state=checked]:bg-primary',
      },
    },
    defaultVariants: {
      shape: 'pill',
      permanent: false,
      size: 'md',
    },
  }
);

const switchThumbVariants = cva(
  'richtext-pointer-events-none richtext-block richtext-bg-white richtext-w-1/2 richtext-h-[calc(100%-4px)] richtext-shadow-lg richtext-ring-0 richtext-transition-transform richtext-start-0 data-[state=unchecked]:richtext-translate-x-[2px] data-[state=checked]:richtext-translate-x-[calc(100%-2px)] rtl:data-[state=unchecked]:-richtext-translate-x-[2px] rtl:data-[state=checked]:-richtext-translate-x-[calc(100%-2px)]',
  {
    variants: {
      shape: {
        pill: 'richtext-rounded-full',
        square: 'richtext-rounded-md',
      },
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
      },
    },
    compoundVariants: [
      {
        shape: 'square',
        size: 'xs',
        className: 'richtext-rounded-sm',
      },
    ],
    defaultVariants: {
      shape: 'pill',
      size: 'md',
    },
  }
);

const switchIndicatorVariants = cva(
  'richtext-text-sm richtext-font-medium richtext-absolute richtext-mx-[2px] richtext-top-1/2 richtext-w-1/2 -richtext-translate-y-1/2 richtext-flex richtext-pointer-events-none richtext-items-center richtext-justify-center richtext-text-center richtext-transition-transform richtext-duration-300 richtext-[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      state: {
        on: 'start-0',
        off: 'end-0',
      },
      permanent: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        state: 'on',
        permanent: false,
        className:
          'richtext-text-primary-foreground peer-data-[state=unchecked]:richtext-invisible peer-data-[state=unchecked]:richtext-translate-x-full rtl:peer-data-[state=unchecked]:-richtext-translate-x-full',
      },
      {
        state: 'off',
        permanent: false,
        className:
          'peer-data-[state=checked]:richtext-invisible -richtext-translate-x-full rtl:richtext-translate-x-full peer-data-[state=unchecked]:richtext-translate-x-0',
      },
      {
        state: 'on',
        permanent: true,
        className: 'start-0',
      },
      {
        state: 'off',
        permanent: true,
        className: 'end-0',
      },
    ],
    defaultVariants: {
      state: 'off',
      permanent: false,
    },
  }
);

function SwitchWrapper({
  className,
  children,
  permanent = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { permanent?: boolean }) {
  return (
    <SwitchContext.Provider value={{ permanent }}>
      <div
        data-slot='switch-wrapper'
        className={cn('richtext-relative richtext-inline-flex richtext-items-center', className)}
        {...props}
      >
        {children}
      </div>
    </SwitchContext.Provider>
  );
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  Omit<
    React.ComponentProps<typeof SwitchPrimitive.Root> &
      VariantProps<typeof switchVariants> & { thumbClassName?: string },
    'ref'
  >
>(function Switch({ className, thumbClassName = '', shape, size, ...props }, ref) {
  const context = useSwitchContext();
  const permanent = context?.permanent ?? false;

  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot='switch'
      className={cn(switchVariants({ shape, size, permanent }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(switchThumbVariants({ shape, size }), thumbClassName)} />
    </SwitchPrimitive.Root>
  );
});

function SwitchIndicator({
  className,
  state,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof switchIndicatorVariants>) {
  const context = useSwitchContext();
  const permanent = context?.permanent ?? false;

  return (
    <span
      data-slot='switch-indicator'
      className={cn(switchIndicatorVariants({ state, permanent }), className)}
      {...props}
    />
  );
}

export { Switch, SwitchIndicator, SwitchWrapper };
