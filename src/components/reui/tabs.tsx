// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/tabs.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Variants for TabsList
const tabsListVariants = cva('richtext-flex richtext-items-center richtext-shrink-0', {
  variants: {
    variant: {
      default: 'richtext-bg-accent richtext-p-1',
      button: '',
      line: 'richtext-border-b richtext-border-border',
    },
    shape: {
      default: '',
      pill: '',
    },
    size: {
      lg: 'richtext-gap-2.5',
      md: 'richtext-gap-2',
      sm: 'richtext-gap-1.5',
      xs: 'richtext-gap-1',
    },
  },
  compoundVariants: [
    { variant: 'default', size: 'lg', className: 'richtext-p-1.5 richtext-gap-2.5' },
    { variant: 'default', size: 'md', className: 'richtext-p-1 richtext-gap-2' },
    { variant: 'default', size: 'sm', className: 'richtext-p-1 richtext-gap-1.5' },
    { variant: 'default', size: 'xs', className: 'richtext-p-1 richtext-gap-1' },

    {
      variant: 'default',
      shape: 'default',
      size: 'lg',
      className: 'richtext-rounded-lg',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'md',
      className: 'richtext-rounded-lg',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'sm',
      className: 'richtext-rounded-md',
    },
    {
      variant: 'default',
      shape: 'default',
      size: 'xs',
      className: 'richtext-rounded-md',
    },

    { variant: 'line', size: 'lg', className: 'richtext-gap-9' },
    { variant: 'line', size: 'md', className: 'richtext-gap-8' },
    { variant: 'line', size: 'sm', className: 'richtext-gap-4' },
    { variant: 'line', size: 'xs', className: 'richtext-gap-4' },

    {
      variant: 'default',
      shape: 'pill',
      className: 'richtext-rounded-full [&_[role=tab]]:richtext-rounded-full',
    },
    {
      variant: 'button',
      shape: 'pill',
      className: 'richtext-rounded-full [&_[role=tab]]:richtext-rounded-full',
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

// Variants for TabsTrigger
const tabsTriggerVariants = cva(
  'richtext-shrink-0 richtext-cursor-pointer richtext-whitespace-nowrap richtext-inline-flex richtext-justify-center richtext-items-center richtext-font-medium richtext-ring-offset-background richtext-transition-colors focus-visible:richtext-outline-none focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 disabled:richtext-pointer-events-none disabled:richtext-opacity-50 data-[disabled]:richtext-pointer-events-none data-[disabled]:richtext-opacity-50 [&_svg]:richtext-shrink-0 [&_svg]:richtext-text-muted-foreground [&:hover_svg]:richtext-text-primary [&[data-state=active]_svg]:richtext-text-primary',
  {
    variants: {
      variant: {
        default:
          'richtext-text-muted-foreground data-[state=active]:richtext-bg-background hover:richtext-text-foreground data-[state=active]:richtext-text-foreground data-[state=active]:richtext-shadow-sm data-[state=active]:richtext-shadow-black/5',
        button:
          'focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 richtext-rounded-lg richtext-text-accent-foreground hover:richtext-text-foreground data-[state=active]:richtext-bg-accent data-[state=active]:richtext-text-foreground',
        line: 'richtext-border-b-2 richtext-text-muted-foreground richtext-border-transparent data-[state=active]:richtext-border-primary hover:richtext-text-primary data-[state=active]:richtext-text-primary data-[state=active]:richtext-border-primary data-[state=active]:richtext-text-primary',
      },
      size: {
        lg: 'richtext-gap-2.5 [&_svg]:richtext-size-5 richtext-text-sm',
        md: 'richtext-gap-2 [&_svg]:richtext-size-4 richtext-text-sm',
        sm: 'richtext-gap-1.5 [&_svg]:richtext-size-3.5 richtext-text-xs',
        xs: 'richtext-gap-1 [&_svg]:richtext-size-3.5 richtext-text-xs',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        size: 'lg',
        className: 'richtext-py-2.5 richtext-px-4 richtext-rounded-md',
      },
      {
        variant: 'default',
        size: 'md',
        className: 'richtext-py-1.5 richtext-px-3 richtext-rounded-md',
      },
      {
        variant: 'default',
        size: 'sm',
        className: 'richtext-py-1.5 richtext-px-2.5 richtext-rounded-sm',
      },
      {
        variant: 'default',
        size: 'xs',
        className: 'richtext-py-1 richtext-px-2 richtext-rounded-sm',
      },

      {
        variant: 'button',
        size: 'lg',
        className: 'richtext-py-3 richtext-px-4 richtext-rounded-lg',
      },
      {
        variant: 'button',
        size: 'md',
        className: 'richtext-py-2.5 richtext-px-3 richtext-rounded-lg',
      },
      {
        variant: 'button',
        size: 'sm',
        className: 'richtext-py-2 richtext-px-2.5 richtext-rounded-md',
      },
      {
        variant: 'button',
        size: 'xs',
        className: 'richtext-py-1.5 richtext-px-2 richtext-rounded-md',
      },

      { variant: 'line', size: 'lg', className: 'richtext-py-3' },
      { variant: 'line', size: 'md', className: 'richtext-py-2.5' },
      { variant: 'line', size: 'sm', className: 'richtext-py-2' },
      { variant: 'line', size: 'xs', className: 'richtext-py-1.5' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Variants for TabsContent
const tabsContentVariants = cva(
  'richtext-mt-2.5 focus-visible:richtext-outline-none focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Context
type TabsContextType = {
  variant?: 'default' | 'button' | 'line';
  size?: 'lg' | 'sm' | 'xs' | 'md';
};
const TabsContext = React.createContext<TabsContextType>({
  variant: 'default',
  size: 'md',
});

// Components
const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  Omit<React.ComponentProps<typeof TabsPrimitive.Root>, 'ref'>
>(function Tabs({ className, ...props }, ref) {
  return <TabsPrimitive.Root ref={ref} data-slot='tabs' className={cn('', className)} {...props} />;
});

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  Omit<
    React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>,
    'ref'
  >
>(function TabsList(
  { className, variant = 'default', shape = 'default', size = 'md', ...props },
  ref
) {
  return (
    <TabsContext.Provider value={{ variant: variant || 'default', size: size || 'md' }}>
      <TabsPrimitive.List
        ref={ref}
        data-slot='tabs-list'
        className={cn(tabsListVariants({ variant, shape, size }), className)}
        {...props}
      />
    </TabsContext.Provider>
  );
});

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  Omit<React.ComponentProps<typeof TabsPrimitive.Trigger>, 'ref'>
>(function TabsTrigger({ className, ...props }, ref) {
  const { variant, size } = React.useContext(TabsContext);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot='tabs-trigger'
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  );
});

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  Omit<
    React.ComponentProps<typeof TabsPrimitive.Content> & VariantProps<typeof tabsContentVariants>,
    'ref'
  >
>(function TabsContent({ className, variant, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot='tabs-content'
      className={cn(tabsContentVariants({ variant }), className)}
      {...props}
    />
  );
});

export { Tabs, TabsContent, TabsList, TabsTrigger };
