import { Check, Plus } from "lucide-react";
import React, { useState } from "react";

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Slider,
  SliderThumb,
} from "@/components/reui";
import { NoFill } from "@/components/icons/NoFill";
import { COLORS_LIST as DEFAULT_COLORS_LIST } from "@/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLocale } from "@/locales";

export interface ColorPickerProps {
  disabled?: boolean;
  colors?: readonly string[];
  children: React.ReactNode;
  onChange?: (color: string | undefined) => void;
  value?: string;
  highlight?: boolean;
}
const validHex = (value: string) => /^#([\da-f]{3}){1,2}$/i.test(value);

/** Specialized color control composed from official ReUI controls, not react-colorful UI. */
function ColorPicker({
  disabled = false,
  value,
  onChange,
  colors = DEFAULT_COLORS_LIST,
  highlight,
  children,
}: ColorPickerProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useLocalStorage<string[]>(
    highlight ? "richtext-recent-highlight" : "richtext-recent-colors",
    [],
  );
  function choose(color: string | undefined) {
    if (color !== undefined && !validHex(color)) return;
    onChange?.(color);
    if (color)
      setRecent(
        [color, ...recent.filter((item) => item !== color)].slice(0, 10),
      );
    setOpen(false);
  }
  function swatch(color: string, key: string) {
    return (
      <Button
        key={key}
        variant="ghost"
        size="icon"
        type="button"
        aria-label={`Color ${color}`}
        aria-pressed={value === color}
        onClick={() => choose(color)}
        className="richtext-size-6 richtext-p-0.5"
      >
        <span
          className="richtext-flex richtext-size-[18px] richtext-items-center richtext-justify-center richtext-rounded-sm richtext-border richtext-border-border"
          style={{ backgroundColor: color }}
        >
          {value === color && (
            <Check
              aria-hidden="true"
              className="richtext-text-white richtext-drop-shadow"
            />
          )}
        </span>
      </Button>
    );
  }
  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="richtext-w-[272px] richtext-p-2"
      >
        <div className="richtext-flex richtext-flex-col richtext-gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => choose(undefined)}
            className="richtext-justify-start"
          >
            <NoFill />
            {t(highlight ? "editor.nofill" : "editor.default")}
          </Button>
          <div
            className="richtext-grid richtext-grid-cols-10"
            aria-label="Color palette"
          >
            {colors.map((color, index) => swatch(color, `palette-${index}`))}
          </div>
          <Separator />
          <span className="richtext-text-xs richtext-text-muted-foreground">
            {t("editor.recent")}
          </span>
          <div className="richtext-flex richtext-flex-wrap">
            {recent
              .filter(validHex)
              .map((color, index) => swatch(color, `recent-${index}`))}
          </div>
          <AddMoreColor setColor={choose} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
function AddMoreColor({ setColor }: { setColor: (color: string) => void }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState("#000000");
  const expanded = /^#[\da-f]{3}$/i.test(hex)
    ? "#" + [...hex.slice(1)].map((c) => c + c).join("")
    : hex;
  const channels = [1, 3, 5].map((index) =>
    validHex(expanded)
      ? Number.parseInt(expanded.slice(index, index + 2), 16)
      : 0,
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button">
          {t("editor.color.more")}…
        </Button>
      </PopoverTrigger>
      <PopoverContent className="richtext-w-64">
        <div className="richtext-flex richtext-flex-col richtext-gap-4">
          <span
            aria-label="Color preview"
            className="richtext-h-8 richtext-rounded richtext-border richtext-border-border"
            style={{ backgroundColor: validHex(hex) ? hex : "transparent" }}
          />
          {["Red", "Green", "Blue"].map((label, index) => (
            <div
              key={label}
              className="richtext-flex richtext-items-center richtext-gap-3"
            >
              <span className="richtext-w-12 richtext-text-xs">{label}</span>
              <Slider
                min={0}
                max={255}
                step={1}
                value={[channels[index]]}
                onValueChange={([value]) => {
                  const next = channels.map((channel, i) =>
                    i === index ? value : channel,
                  );
                  setHex(
                    "#" +
                      next
                        .map((channel) => channel.toString(16).padStart(2, "0"))
                        .join(""),
                  );
                }}
              >
                <SliderThumb aria-label={label} />
              </Slider>
            </div>
          ))}
          <Input
            aria-label="Hex color"
            value={hex}
            aria-invalid={!validHex(hex)}
            onChange={(event) =>
              setHex(
                event.target.value.startsWith("#")
                  ? event.target.value
                  : "#" + event.target.value,
              )
            }
          />
          <Button
            type="button"
            disabled={!validHex(hex)}
            aria-label="Apply custom color"
            onClick={() => {
              setColor(hex);
              setOpen(false);
            }}
          >
            <Plus />
            {t("editor.color.more")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
export { ColorPicker };
