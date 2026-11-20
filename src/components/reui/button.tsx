import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { Slot as SlotPrimitive } from 'radix-ui';
// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/button.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'richtext-cursor-pointer richtext-group richtext-whitespace-nowrap focus-visible:richtext-outline-none richtext-inline-flex richtext-items-center richtext-justify-center has-[[data-arrow=true]]:richtext-justify-between richtext-whitespace-nowrap richtext-text-sm richtext-font-medium richtext-ring-offset-background richtext-transition-[color,box-shadow] disabled:richtext-pointer-events-none disabled:richtext-opacity-60 [&_svg]:richtext-shrink-0',
  {
    variants: {
      variant: {
        primary:
          'richtext-bg-primary richtext-text-primary-foreground hover:richtext-bg-primary/90 data-[state=open]:richtext-bg-primary/90',
        mono: 'richtext-bg-zinc-950 richtext-text-white dark:richtext-bg-zinc-300 dark:richtext-text-black hover:richtext-bg-zinc-950/90 dark:hover:richtext-bg-zinc-300/90 data-[state=open]:richtext-bg-zinc-950/90 dark:data-[state=open]:richtext-bg-zinc-300/90',
        destructive:
          'richtext-bg-destructive richtext-text-destructive-foreground hover:richtext-bg-destructive/90 data-[state=open]:richtext-bg-destructive/90',
        secondary:
          'richtext-bg-secondary richtext-text-secondary-foreground hover:richtext-bg-secondary/90 data-[state=open]:richtext-bg-secondary/90',
        outline:
          'richtext-bg-background richtext-text-accent-foreground richtext-border richtext-border-input hover:richtext-bg-accent data-[state=open]:richtext-bg-accent',
        dashed:
          'richtext-text-accent-foreground richtext-border richtext-border-input richtext-border-dashed richtext-bg-background hover:richtext-bg-accent hover:richtext-text-accent-foreground data-[state=open]:richtext-text-accent-foreground',
        ghost:
          'richtext-text-accent-foreground hover:richtext-bg-accent hover:richtext-text-accent-foreground data-[state=open]:richtext-bg-accent data-[state=open]:richtext-text-accent-foreground',
        dim: 'richtext-text-muted-foreground hover:richtext-text-foreground data-[state=open]:richtext-text-foreground',
        foreground: '',
        inverse: '',
      },
      appearance: {
        default: '',
        ghost: '',
      },
      underline: {
        solid: '',
        dashed: '',
      },
      underlined: {
        solid: '',
        dashed: '',
      },
      size: {
        lg: 'richtext-h-10 richtext-px-4 richtext-text-sm richtext-gap-1.5 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
        md: 'richtext-h-9 richtext-px-3 richtext-gap-1.5 richtext-text-sm [&_svg:not([class*=richtext-size-])]:richtext-size-4',
        sm: 'richtext-h-8 richtext-px-2.5 richtext-gap-1.25 richtext-text-xs [&_svg:not([class*=richtext-size-])]:richtext-size-3.5',
        xs: 'richtext-h-7 richtext-px-2 richtext-gap-1 richtext-text-xs [&_svg:not([class*=richtext-size-])]:richtext-size-3.5',
        icon: 'richtext-size-9 [&_svg:not([class*=richtext-size-])]:richtext-size-4 richtext-shrink-0',
      },
      autoHeight: {
        true: '',
        false: '',
      },
      radius: {
        md: 'richtext-rounded-md',
        full: 'richtext-rounded-full',
      },
      mode: {
        default:
          'focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2',
        icon: 'focus-visible:richtext-ring-2 focus-visible:richtext-ring-ring focus-visible:richtext-ring-offset-2 richtext-shrink-0',
        link: 'richtext-text-primary richtext-h-auto richtext-p-0 richtext-bg-transparent richtext-rounded-none hover:richtext-bg-transparent data-[state=open]:richtext-bg-transparent',
        input:
          'richtext-justify-start richtext-font-normal hover:richtext-bg-background [&_svg]:richtext-transition-colors [&_svg]:hover:richtext-text-foreground data-[state=open]:richtext-bg-background focus-visible:richtext-border-ring focus-visible:richtext-outline-none focus-visible:richtext-ring-[3px] focus-visible:richtext-ring-ring/30 [[data-state=open]>&]:richtext-border-ring [[data-state=open]>&]:richtext-outline-none [[data-state=open]>&]:richtext-ring-[3px] [[data-state=open]>&]:richtext-ring-ring/30 aria-invalid:richtext-border-destructive/60 aria-invalid:richtext-ring-destructive/10 dark:aria-invalid:richtext-border-destructive dark:aria-invalid:richtext-ring-destructive/20 in-data-[invalid=true]:richtext-border-destructive/60 in-data-[invalid=true]:richtext-ring-destructive/10 dark:in-data-[invalid=true]:richtext-border-destructive dark:in-data-[invalid=true]:richtext-ring-destructive/20',
      },
      placeholder: {
        true: 'richtext-text-muted-foreground',
        false: '',
      },
    },
    compoundVariants: [
      // Icons opacity for default mode
      {
        variant: 'ghost',
        mode: 'default',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },
      {
        variant: 'outline',
        mode: 'default',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },
      {
        variant: 'dashed',
        mode: 'default',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },
      {
        variant: 'secondary',
        mode: 'default',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },

      // Icons opacity for default mode
      {
        variant: 'outline',
        mode: 'input',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },
      {
        variant: 'outline',
        mode: 'icon',
        className:
          '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:richtext-opacity-60',
      },

      // Auto height
      {
        size: 'xs',
        autoHeight: true,
        className: 'richtext-h-auto richtext-min-h-7',
      },
      {
        size: 'md',
        autoHeight: true,
        className: 'richtext-h-auto richtext-min-h-9',
      },
      {
        size: 'sm',
        autoHeight: true,
        className: 'richtext-h-auto richtext-min-h-8',
      },
      {
        size: 'lg',
        autoHeight: true,
        className: 'richtext-h-auto richtext-min-h-10',
      },

      // Shadow support
      {
        variant: 'primary',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'mono',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'secondary',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'outline',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'dashed',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'destructive',
        mode: 'default',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },

      // Shadow support
      {
        variant: 'primary',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'mono',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'secondary',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'outline',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'dashed',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },
      {
        variant: 'destructive',
        mode: 'icon',
        appearance: 'default',
        className: 'richtext-shadow-sm richtext-shadow-black/5',
      },

      // Link
      {
        variant: 'primary',
        mode: 'link',
        underline: 'solid',
        className:
          'richtext-font-medium richtext-text-primary hover:richtext-text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-solid',
      },
      {
        variant: 'primary',
        mode: 'link',
        underline: 'dashed',
        className:
          'richtext-font-medium richtext-text-primary hover:richtext-text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-dashed richtext-decoration-1',
      },
      {
        variant: 'primary',
        mode: 'link',
        underlined: 'solid',
        className:
          'richtext-font-medium richtext-text-primary hover:richtext-text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-solid',
      },
      {
        variant: 'primary',
        mode: 'link',
        underlined: 'dashed',
        className:
          'richtext-font-medium richtext-text-primary hover:richtext-text-primary/90 [&_svg]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-dashed richtext-decoration-1',
      },

      {
        variant: 'inverse',
        mode: 'link',
        underline: 'solid',
        className:
          'richtext-font-medium richtext-text-inherit [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-solid',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underline: 'dashed',
        className:
          'richtext-font-medium richtext-text-inherit [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-dashed richtext-decoration-1',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underlined: 'solid',
        className:
          'richtext-font-medium richtext-text-inherit [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-solid',
      },
      {
        variant: 'inverse',
        mode: 'link',
        underlined: 'dashed',
        className:
          'richtext-font-medium richtext-text-inherit [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-dashed richtext-decoration-1',
      },

      {
        variant: 'foreground',
        mode: 'link',
        underline: 'solid',
        className:
          'richtext-font-medium richtext-text-foreground [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-solid',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underline: 'dashed',
        className:
          'richtext-font-medium richtext-text-foreground [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 hover:richtext-underline hover:richtext-underline-offset-4 hover:richtext-decoration-dashed richtext-decoration-1',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underlined: 'solid',
        className:
          'richtext-font-medium richtext-text-foreground [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-solid',
      },
      {
        variant: 'foreground',
        mode: 'link',
        underlined: 'dashed',
        className:
          'richtext-font-medium richtext-text-foreground [&_svg:not([role=img]):not([class*=text-])]:richtext-opacity-60 richtext-underline richtext-underline-offset-4 richtext-decoration-dashed richtext-decoration-1',
      },

      // Ghost
      {
        variant: 'primary',
        appearance: 'ghost',
        className:
          'richtext-bg-transparent richtext-text-primary/90 hover:richtext-bg-primary/5 data-[state=open]:richtext-bg-primary/5',
      },
      {
        variant: 'destructive',
        appearance: 'ghost',
        className:
          'richtext-bg-transparent richtext-text-destructive/90 hover:richtext-bg-destructive/5 data-[state=open]:richtext-bg-destructive/5',
      },
      {
        variant: 'ghost',
        mode: 'icon',
        className: 'richtext-text-muted-foreground',
      },

      // Size
      {
        size: 'xs',
        mode: 'icon',
        className:
          'richtext-w-7 richtext-h-7 richtext-p-0 richtext-[[&_svg:not([class*=size-])]:size-3.5',
      },
      {
        size: 'sm',
        mode: 'icon',
        className:
          'richtext-w-8 richtext-h-8 richtext-p-0 richtext-[[&_svg:not([class*=size-])]:size-3.5',
      },
      {
        size: 'md',
        mode: 'icon',
        className:
          'richtext-w-9 richtext-h-9 richtext-p-0 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
      },
      {
        size: 'icon',
        className:
          'richtext-w-9 richtext-h-9 richtext-p-0 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
      },
      {
        size: 'lg',
        mode: 'icon',
        className:
          'richtext-w-10 richtext-h-10 richtext-p-0 [&_svg:not([class*=richtext-size-])]:richtext-size-4',
      },

      // Input mode
      {
        mode: 'input',
        placeholder: true,
        variant: 'outline',
        className: 'richtext-font-normal richtext-text-muted-foreground',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'sm',
        className: 'richtext-gap-1.25',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'md',
        className: 'richtext-gap-1.5',
      },
      {
        mode: 'input',
        variant: 'outline',
        size: 'lg',
        className: 'richtext-gap-1.5',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      mode: 'default',
      size: 'md',
      radius: 'md',
      appearance: 'default',
    },
  }
);

const Button = React.forwardRef<
  React.ComponentRef<'button'>,
  Omit<
    React.ComponentProps<'button'> &
      VariantProps<typeof buttonVariants> & {
        selected?: boolean;
        asChild?: boolean;
      },
    'ref'
  >
>(function Button(
  {
    className,
    selected,
    variant,
    radius,
    appearance,
    mode,
    size,
    autoHeight,
    underlined,
    underline,
    asChild = false,
    placeholder = false,
    ...props
  },
  ref
) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button';
  return (
    <Comp
      ref={ref}
      data-slot='button'
      className={cn(
        buttonVariants({
          variant,
          size,
          radius,
          appearance,
          mode,
          autoHeight,
          placeholder,
          underlined,
          underline,
          className,
        }),
        asChild && props.disabled && 'richtext-pointer-events-none richtext-opacity-50'
      )}
      {...(selected && { 'data-state': 'open' })}
      {...props}
    />
  );
});

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon; // Allows passing any Lucide icon
}

function ButtonArrow({ icon: Icon = ChevronDown, className, ...props }: ButtonArrowProps) {
  return (
    <Icon
      data-slot='button-arrow'
      className={cn('-richtext-me-1 richtext-ms-auto', className)}
      {...props}
    />
  );
}

export { Button, ButtonArrow, buttonVariants };
