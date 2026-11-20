// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/sonner.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
'use client';

import * as React from 'react';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/theme/theme';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme === 'dark' ? 'dark' : 'light'}
      className='richtext-toaster [&_[data-type=success]>[data-icon]]:richtext-text-success [&_[data-type=success]_[data-title]]:richtext-text-success [&_[data-type=info]_[data-title]]:richtext-text-info richtext-group [&_[data-type=error]>[data-icon]]:richtext-text-destructive [&_[data-type=error]_[data-title]]:richtext-text-destructive'
      toastOptions={{
        classNames: {
          toast:
            'richtext-group richtext-toast richtext-bg-background richtext-text-foreground richtext-border-border richtext-shadow-lg',
          description: 'richtext-text-muted-foreground',
          actionButton: 'richtext-rounded-md richtext-bg-primary richtext-text-primary-foreground',
          cancelButton:
            'richtext-rounded-md richtext-bg-secondary richtext-text-secondary-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
