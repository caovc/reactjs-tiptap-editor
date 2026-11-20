import type * as React from "react";
import type { ExternalToast } from "sonner";

// Compatibility input for the editor's notification helpers; rendered by ReUI Sonner.
export type ToastProps = Pick<
  ExternalToast,
  "duration" | "description" | "action"
> & {
  title?: React.ReactNode;
  variant?: "default" | "destructive";
};
export type ToastActionElement = React.ReactElement;
export { Toaster } from "./reui/sonner";

import { toast as notify, useSonner } from "sonner";

let nextId = 0;

function toast({ title, description, variant, ...options }: ToastProps) {
  const emit = variant === "destructive" ? notify.error : notify;
  const id = `richtext-${++nextId}`;
  emit(title, { ...options, description, id });
  return {
    id,
    dismiss: () => notify.dismiss(id),
    update: ({
      title: nextTitle,
      variant: nextVariant,
      ...next
    }: ToastProps) => {
      const update =
        (nextVariant ?? variant) === "destructive" ? notify.error : notify;
      update(nextTitle ?? title, { ...next, id });
    },
  };
}
function useToast() {
  const { toasts } = useSonner();
  return { toasts, toast, dismiss: (id?: string) => notify.dismiss(id) };
}
export { toast, useToast };
