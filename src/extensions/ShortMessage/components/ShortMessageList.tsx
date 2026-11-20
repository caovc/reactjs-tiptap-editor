import { Card } from "@/components/reui/card";
import { Button as ReuiButton } from "@/components/reui/button";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import scrollIntoView from "scroll-into-view-if-needed";

import { cn } from "@/lib/utils";
import { useLocale } from "@/locales";

import type { ShortMessageItem } from "../types";
import type { SuggestionHandle } from "@/utils/renderNodeView";
import type { SuggestionProps } from "@tiptap/suggestion";

function ShortMessageList(
  props: SuggestionProps<ShortMessageItem>,
  ref: React.ForwardedRef<SuggestionHandle>,
) {
  const $container = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useLocale();

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (!item) return;
    props.command(item);
  };

  const upHandler = () => {
    if (!props.items.length) return;
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length,
    );
  };

  const downHandler = () => {
    if (!props.items.length) return;
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useEffect(() => {
    const el = $container.current?.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (el) scrollIntoView(el, { behavior: "smooth", scrollMode: "if-needed" });
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <Card
      className="richtext-max-h-[min(80vh,24rem)] richtext-min-w-48 richtext-max-w-80 richtext-overflow-y-auto richtext-overflow-x-hidden richtext-p-1 "
      data-richtext-portal
      ref={$container}
    >
      {props.items.length > 0 ? (
        <div className="richtext-grid richtext-grid-cols-1 richtext-gap-0.5">
          {props.items.map((item, index) => (
            <ReuiButton
              variant="ghost"
              size="sm"
              className={cn(
                "richtext-flex richtext-w-full richtext-flex-col richtext-items-start richtext-gap-0.5 richtext-rounded-sm richtext-px-2 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground richtext-transition-colors hover:!richtext-bg-accent",
                { "bg-item-active": index === selectedIndex },
              )}
              data-index={index}
              key={`short-message-${item.short}-${index}`}
              onClick={(e) => {
                e.preventDefault();
                selectItem(index);
              }}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              <span className="richtext-font-medium">{item.short}</span>

              <span className="richtext-w-full richtext-truncate richtext-text-xs richtext-text-muted-foreground">
                {item.long_content}
              </span>
            </ReuiButton>
          ))}
        </div>
      ) : (
        <div className="richtext-p-3">
          <span className="richtext-text-xs richtext-text-foreground">
            {t("editor.shortMessage.empty")}
          </span>
        </div>
      )}
    </Card>
  );
}

export default forwardRef(ShortMessageList);
