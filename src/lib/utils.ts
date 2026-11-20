import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The registry components and their consumers share Tailwind 3's richtext- namespace.
// An unconfigured (or Tailwind 4) merger treats these as unrelated custom classes.
const merge = extendTailwindMerge({ prefix: 'richtext-' });

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
