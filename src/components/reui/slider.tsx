// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/slider.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive } from "radix-ui";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "ref">
>(function Slider({ className, children, ...props }, ref) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      className={cn(
        "richtext-relative richtext-flex richtext-h-4 richtext-w-full richtext-touch-none richtext-select-none richtext-items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="richtext-relative richtext-h-1.5 richtext-w-full richtext-overflow-hidden richtext-rounded-full richtext-bg-accent">
        <SliderPrimitive.Range className="richtext-absolute richtext-h-full richtext-bg-primary" />
      </SliderPrimitive.Track>
      {children}
    </SliderPrimitive.Root>
  );
});

const SliderThumb = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Thumb>,
  Omit<React.ComponentProps<typeof SliderPrimitive.Thumb>, "ref">
>(function SliderThumb({ className, ...props }, ref) {
  return (
    <SliderPrimitive.Thumb
      ref={ref}
      data-slot="slider-thumb"
      className={cn(
        "richtext-box-content richtext-block richtext-size-4 richtext-shrink-0 richtext-cursor-pointer richtext-rounded-full richtext-border-[2px] richtext-border-primary richtext-bg-primary-foreground richtext-shadow-sm richtext-shadow-black/5 richtext-outline-none focus:richtext-outline-none",
        className,
      )}
      {...props}
    />
  );
});

export { Slider, SliderThumb };
