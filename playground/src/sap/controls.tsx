import { useCurrentEditor } from '@tiptap/react';
import { type ReactNode, useId } from 'react';

import { Button } from '@/components/reui/button';
import { Label } from '@/components/reui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/reui/select';
import { Toggle } from '@/components/reui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/reui/tooltip';

import { isolateHistory } from './extensions';

export function Choice({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const { editor } = useCurrentEditor();
  const available = options.some((option) => option.value === value)
    ? options
    : [{ value, label: value }, ...options];
  return (
    <Select value={value} onValueChange={(value) => isolateHistory(editor, () => onChange(value))}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={(event) => event.preventDefault()}>
        <SelectGroup>
          {available.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
export function Action({
  label,
  children,
  onClick,
  disabled,
  text = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  text?: boolean;
}) {
  const { editor } = useCurrentEditor();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          aria-label={label}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => isolateHistory(editor, onClick)}
        >
          {children}
          {text && <span>{label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  );
}
export function Format({
  label,
  active,
  children,
  run,
}: {
  label: string;
  active: boolean;
  children: ReactNode;
  run: () => void;
}) {
  const { editor } = useCurrentEditor();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size='sm'
          aria-label={label}
          pressed={active}
          onMouseDown={(event) => event.preventDefault()}
          onPressedChange={() => isolateHistory(editor, run)}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  );
}
export function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className='sap-ribbon-group'>
      <div className='sap-ribbon-controls'>{children}</div>
      <legend>{label}</legend>
    </fieldset>
  );
}
export function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className='sap-field'>
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
    </div>
  );
}
