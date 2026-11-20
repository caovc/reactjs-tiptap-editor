// Adapted from keenthemes/reui@a98dda1432a74c2e3d6680887325f859eaa32cdf, registry/default/ui/card.tsx.
// MIT license: docs/reui/LICENSE.md. Namespaced for this editor's Tailwind v3.
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Define CardContext
type CardContextType = {
  variant: "default" | "accent";
};

const CardContext = React.createContext<CardContextType>({
  variant: "default", // Default value
});

// Hook to use CardContext
const useCardContext = () => {
  const context = React.useContext(CardContext);
  if (!context) {
    throw new Error("useCardContext must be used within a Card component");
  }
  return context;
};

// Variants
const cardVariants = cva(
  "richtext-flex richtext-flex-col richtext-items-stretch richtext-text-card-foreground richtext-rounded-xl",
  {
    variants: {
      variant: {
        default:
          "richtext-bg-card richtext-border richtext-border-border richtext-shadow-sm richtext-black/5",
        accent: "richtext-bg-muted richtext-shadow-sm richtext-p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const cardHeaderVariants = cva(
  "richtext-flex richtext-items-center richtext-justify-between richtext-flex-wrap richtext-px-5 richtext-min-h-14 richtext-gap-2.5",
  {
    variants: {
      variant: {
        default: "richtext-border-b richtext-border-border",
        accent: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const cardContentVariants = cva("richtext-grow richtext-p-5", {
  variants: {
    variant: {
      default: "",
      accent:
        "richtext-bg-card richtext-rounded-t-xl [&:last-child]:richtext-rounded-b-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const cardTableVariants = cva("richtext-grid richtext-grow", {
  variants: {
    variant: {
      default: "",
      accent: "richtext-bg-card richtext-rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const cardFooterVariants = cva(
  "richtext-flex richtext-items-center richtext-px-5 richtext-min-h-14",
  {
    variants: {
      variant: {
        default: "richtext-border-t richtext-border-border",
        accent: "richtext-bg-card richtext-rounded-b-xl richtext-mt-[2px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Card Component
const Card = React.forwardRef<
  React.ComponentRef<"div">,
  Omit<
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>,
    "ref"
  >
>(function Card({ className, variant = "default", ...props }, ref) {
  return (
    <CardContext.Provider value={{ variant: variant || "default" }}>
      <div
        ref={ref}
        data-slot="card"
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    </CardContext.Provider>
  );
});

// CardHeader Component
function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ variant }), className)}
      {...props}
    />
  );
}

// CardContent Component
function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ variant }), className)}
      {...props}
    />
  );
}

// CardTable Component
function CardTable({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      data-slot="card-table"
      className={cn(cardTableVariants({ variant }), className)}
      {...props}
    />
  );
}

// CardFooter Component
function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useCardContext();
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ variant }), className)}
      {...props}
    />
  );
}

// Other Components
function CardHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-heading"
      className={cn("richtext-space-y-1", className)}
      {...props}
    />
  );
}

function CardToolbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-toolbar"
      className={cn(
        "richtext-flex richtext-items-center richtext-gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "richtext-text-base richtext-font-semibold richtext-leading-none richtext-tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "richtext-text-sm richtext-text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

// Exports
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
};
