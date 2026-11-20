import { cva, type VariantProps } from 'class-variance-authority';
import { Slot as SlotPrimitive } from 'radix-ui';
// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/input.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
import * as React from 'react';

import { cn } from '@/lib/utils';

// Define input size variants
const inputVariants = cva(
  'richtext-flex richtext-w-full richtext-bg-background richtext-border richtext-border-input richtext-shadow-sm richtext-shadow-black/5 richtext-transition-[color,box-shadow] richtext-text-foreground placeholder:richtext-text-muted-foreground/80 focus-visible:richtext-ring-ring/30 focus-visible:richtext-border-ring focus-visible:richtext-outline-none focus-visible:richtext-ring-[3px] disabled:richtext-cursor-not-allowed disabled:richtext-opacity-60 [&[readonly]]:richtext-bg-muted/80 [&[readonly]]:richtext-cursor-not-allowed file:richtext-h-full [&[type=file]]:richtext-py-0 file:richtext-border-solid file:richtext-border-input file:richtext-bg-transparent file:richtext-font-medium file:richtext-not-italic file:richtext-text-foreground file:richtext-p-0 file:richtext-border-0 file:richtext-border-e aria-[invalid=true]:richtext-border-destructive/60 aria-[invalid=true]:richtext-ring-destructive/10 dark:aria-[invalid=true]:richtext-border-destructive dark:aria-[invalid=true]:richtext-ring-destructive/20',
  {
    variants: {
      variant: {
        lg: 'richtext-h-10 richtext-px-4 richtext-text-sm richtext-rounded-md file:richtext-pe-4 file:richtext-me-4',
        md: 'richtext-h-9 richtext-px-3 richtext-text-sm richtext-rounded-md file:richtext-pe-3 file:richtext-me-3',
        sm: 'richtext-h-8 richtext-px-2.5 richtext-text-xs richtext-rounded-md file:richtext-pe-2.5 file:richtext-me-2.5',
      },
    },
    defaultVariants: {
      variant: 'md',
    },
  }
);

const inputAddonVariants = cva(
  'richtext-flex richtext-items-center richtext-shrink-0 richtext-justify-center richtext-bg-muted richtext-border richtext-border-input richtext-shadow-sm richtext-shadow-[rgba(0,0,0,0.05)] richtext-text-secondary-foreground [&_svg]:richtext-text-secondary-foreground/60',
  {
    variants: {
      variant: {
        lg: 'richtext-rounded-md richtext-h-10 richtext-min-w-10 richtext-px-4 richtext-text-sm [&_svg:not([class*=richtext-size-])]:richtext-size-4.5',
        md: 'richtext-rounded-md richtext-h-9 richtext-min-w-9 richtext-px-3 richtext-text-sm [&_svg:not([class*=richtext-size-])]:richtext-size-4.5',
        sm: 'richtext-rounded-md richtext-h-8 richtext-min-w-7 richtext-text-xs richtext-px-2.5 [&_svg:not([class*=richtext-size-])]:richtext-size-3.5',
      },
      mode: {
        default: '',
        icon: 'richtext-px-0 richtext-justify-center',
      },
    },
    defaultVariants: {
      variant: 'md',
      mode: 'default',
    },
  }
);

const inputGroupVariants = cva(
  'richtext-flex richtext-items-stretch [&_[data-slot=input]]:richtext-grow [&_[data-slot=input-addon]:has(+[data-slot=input])]:richtext-rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:richtext-border-e-0 [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:richtext-rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:richtext-border-e-0 [&_[data-slot=input]+[data-slot=input-addon]]:richtext-rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:richtext-border-s-0 [&_[data-slot=input-addon]:has(+[data-slot=button])]:richtext-rounded-e-none [&_[data-slot=input]+[data-slot=button]]:richtext-rounded-s-none [&_[data-slot=button]+[data-slot=input]]:richtext-rounded-s-none [&_[data-slot=input-addon]+[data-slot=input]]:richtext-rounded-s-none [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:richtext-rounded-s-none [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:richtext-rounded-e-none [&_[data-slot=input]:has(+[data-slot=button])]:richtext-rounded-e-none [&_[data-slot=input]:has(+[data-slot=input-addon])]:richtext-rounded-e-none [&_[data-slot=datefield]]:richtext-grow [&_[data-slot=datefield]+[data-slot=input-addon]]:richtext-rounded-s-none [&_[data-slot=datefield]+[data-slot=input-addon]]:richtext-border-s-0 [&_[data-slot=datefield]:has(~[data-slot=input-addon])]:[&_[data-slot=input]]:richtext-rounded-e-none [&_[data-slot=datefield]~[data-slot=input-addon]]:richtext-rounded-s-none',
  {
    variants: {},
    defaultVariants: {},
  }
);

const inputWrapperVariants = cva(
  'richtext-flex richtext-items-center richtext-gap-1.5 has-[:focus-visible]:richtext-ring-ring/30 has-[:focus-visible]:richtext-border-ring has-[:focus-visible]:richtext-outline-none has-[:focus-visible]:richtext-ring-[3px] [&_[data-slot=datefield]]:richtext-grow [&_[data-slot=input]]:data-[focus-within]:richtext-ring-transparent [&_[data-slot=input]]:data-[focus-within]:richtext-ring-0 [&_[data-slot=input]]:data-[focus-within]:richtext-border-0 [&_[data-slot=input]]:richtext-flex [&_[data-slot=input]]:richtext-w-full [&_[data-slot=input]]:richtext-outline-none [&_[data-slot=input]]:richtext-transition-colors [&_[data-slot=input]]:richtext-text-foreground [&_[data-slot=input]]:placeholder:richtext-text-muted-foreground [&_[data-slot=input]]:richtext-border-0 [&_[data-slot=input]]:richtext-bg-transparent [&_[data-slot=input]]:richtext-p-0 [&_[data-slot=input]]:richtext-shadow-none [&_[data-slot=input]]:focus-visible:richtext-ring-0 [&_[data-slot=input]]:richtext-h-auto [&_[data-slot=input]]:disabled:richtext-cursor-not-allowed [&_[data-slot=input]]:disabled:richtext-opacity-50 [&_svg]:richtext-text-muted-foreground [&_svg]:richtext-shrink-0 has-[[aria-invalid=true]]:richtext-border-destructive/60 has-[[aria-invalid=true]]:richtext-ring-destructive/10 dark:has-[[aria-invalid=true]]:richtext-border-destructive dark:has-[[aria-invalid=true]]:richtext-ring-destructive/20',
  {
    variants: {
      variant: {
        sm: 'richtext-gap-1.25 [&_svg:not([class*=richtext-size-])]:richtext-size-3.5',
        md: 'richtext-gap-1.5 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
        lg: 'richtext-gap-1.5 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
      },
    },
    defaultVariants: {
      variant: 'md',
    },
  }
);

const Input = React.forwardRef<
  React.ComponentRef<'input'>,
  Omit<
    React.ComponentProps<'input'> & VariantProps<typeof inputVariants> & { asChild?: boolean },
    'ref'
  >
>(function Input({ className, type, variant, asChild = false, ...props }, ref) {
  const Comp = asChild ? SlotPrimitive.Slot : 'input';
  return (
    <Comp
      ref={ref}
      data-slot='input'
      type={type}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
});

function InputAddon({
  className,
  variant,
  mode,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputAddonVariants>) {
  return (
    <div
      data-slot='input-addon'
      className={cn(inputAddonVariants({ variant, mode }), className)}
      {...props}
    />
  );
}

function InputGroup({
  className,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return <div data-slot='input-group' className={cn(inputGroupVariants(), className)} {...props} />;
}

function InputWrapper({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputWrapperVariants>) {
  return (
    <div
      data-slot='input-wrapper'
      className={cn(inputVariants({ variant }), inputWrapperVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Input, InputAddon, InputGroup, InputWrapper, inputVariants, inputAddonVariants };
