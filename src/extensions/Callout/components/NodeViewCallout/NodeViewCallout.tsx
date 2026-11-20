import { NodeViewWrapper } from "@tiptap/react";
import {
  AlertCircle,
  Info,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";

import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "@/components/reui/alert";

import type { NodeViewProps } from "@tiptap/react";

const CALLOUT_TYPES = [
  {
    value: "note",
    label: "Note",
    icon: Info,
    variant: "primary",
  },
  {
    value: "tip",
    label: "Tip",
    icon: Lightbulb,
    variant: "success",
  },
  {
    value: "important",
    label: "Important",
    icon: AlertCircle,
    variant: "info",
  },
  {
    value: "warning",
    label: "Warning",
    icon: TriangleAlert,
    variant: "warning",
  },
  {
    value: "caution",
    label: "Caution",
    icon: OctagonAlert,
    variant: "destructive",
  },
] as const;

export function NodeViewCallout({ node }: NodeViewProps) {
  const { type = "note", title = "", body = "" } = node.attrs;

  const currentType =
    CALLOUT_TYPES.find((t) => t.value === type) || CALLOUT_TYPES[0];
  const IconComponent = currentType.icon;

  return (
    <NodeViewWrapper>
      <Alert
        role="note"
        appearance="outline"
        variant={currentType.variant}
        className="richtext-my-4"
      >
        <AlertIcon>
          <IconComponent />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>{title}</AlertTitle>
          {body && (
            <AlertDescription
              className="richtext-whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
        </AlertContent>
      </Alert>
    </NodeViewWrapper>
  );
}
