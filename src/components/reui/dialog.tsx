// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/dialog.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const dialogContentVariants = cva(
  'richtext-flex richtext-flex-col richtext-max-h-[calc(100dvh-2rem)] richtext-overflow-y-auto richtext-fixed richtext-outline-0 richtext-z-50 richtext-border richtext-border-border richtext-bg-background richtext-p-6 richtext-shadow-lg richtext-shadow-black/5 richtext-duration-200 data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0 data-[state=closed]:richtext-zoom-out-95 data-[state=open]:richtext-zoom-in-95 sm:richtext-rounded-lg',
  {
    variants: {
      variant: {
        default:
          'richtext-left-[50%] richtext-top-[50%] richtext-max-w-lg richtext-translate-x-[-50%] richtext-translate-y-[-50%] richtext-w-[calc(100vw-2rem)]',
        fullscreen: 'richtext-inset-5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

const DialogTrigger = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Trigger>,
  Omit<React.ComponentProps<typeof DialogPrimitive.Trigger>, 'ref'>
>(function DialogTrigger({ ...props }, ref) {
  return <DialogPrimitive.Trigger ref={ref} data-slot='dialog-trigger' {...props} />;
});

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

const DialogClose = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Close>,
  Omit<React.ComponentProps<typeof DialogPrimitive.Close>, 'ref'>
>(function DialogClose({ ...props }, ref) {
  return <DialogPrimitive.Close ref={ref} data-slot='dialog-close' {...props} />;
});

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, 'ref'>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-richtext-portal
      data-slot='dialog-overlay'
      className={cn(
        'richtext-fixed richtext-inset-0 richtext-z-50 richtext-bg-black/30 richtext-backdrop-blur-[4px] data-[state=open]:richtext-animate-in data-[state=closed]:richtext-animate-out data-[state=closed]:richtext-fade-out-0 data-[state=open]:richtext-fade-in-0',
        className
      )}
      {...props}
    />
  );
});

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  Omit<
    React.ComponentProps<typeof DialogPrimitive.Content> &
      VariantProps<typeof dialogContentVariants> & {
        showCloseButton?: boolean;
        overlay?: boolean;
      },
    'ref'
  >
>(function DialogContent(
  { className, children, showCloseButton = true, overlay = true, variant, ...props },
  ref
) {
  return (
    <DialogPortal>
      {overlay && <DialogOverlay />}
      <DialogPrimitive.Content
        ref={ref}
        data-richtext-portal
        data-slot='dialog-content'
        className={cn(dialogContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose className='richtext-absolute richtext-end-5 richtext-top-5 richtext-cursor-pointer richtext-rounded-sm richtext-opacity-60 richtext-outline-0 richtext-ring-offset-background richtext-transition-opacity hover:richtext-opacity-100 focus:richtext-outline-none disabled:richtext-pointer-events-none data-[state=open]:richtext-bg-accent data-[state=open]:richtext-text-muted-foreground'>
            <X className='richtext-size-4' />
            <span className='richtext-sr-only'>Close</span>
          </DialogClose>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

export default DialogContent;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot='dialog-header'
    className={cn(
      'richtext-mb-5 richtext-flex richtext-flex-col richtext-space-y-1 richtext-text-center sm:richtext-text-start',
      className
    )}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot='dialog-footer'
    className={cn(
      'richtext-flex richtext-flex-col-reverse richtext-pt-5 sm:richtext-flex-row sm:richtext-justify-end sm:richtext-space-x-2.5',
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  Omit<React.ComponentProps<typeof DialogPrimitive.Title>, 'ref'>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot='dialog-title'
      className={cn(
        'richtext-text-lg richtext-font-semibold richtext-leading-none richtext-tracking-tight',
        className
      )}
      {...props}
    />
  );
});

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot='dialog-body' className={cn('richtext-grow', className)} {...props} />
);

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  Omit<React.ComponentProps<typeof DialogPrimitive.Description>, 'ref'>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot='dialog-description'
      className={cn('richtext-text-sm richtext-text-muted-foreground', className)}
      {...props}
    />
  );
});

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
