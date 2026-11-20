import ts from "typescript";

// ReUI v1 uses React 19 ref-as-prop. Keep this library's React 18 peer contract:
// add forwardRef at DOM-facing boundaries, without changing the ReUI body/API.
const primitives = {
  Slider: "SliderPrimitive.Root",
  SliderThumb: "SliderPrimitive.Thumb",
  Checkbox: "CheckboxPrimitive.Root",
  DialogTrigger: "DialogPrimitive.Trigger",
  DialogClose: "DialogPrimitive.Close",
  DialogOverlay: "DialogPrimitive.Overlay",
  DialogContent: "DialogPrimitive.Content",
  DialogTitle: "DialogPrimitive.Title",
  DialogDescription: "DialogPrimitive.Description",
  DropdownMenuTrigger: "DropdownMenuPrimitive.Trigger",
  DropdownMenuSubTrigger: "DropdownMenuPrimitive.SubTrigger",
  DropdownMenuSubContent: "DropdownMenuPrimitive.SubContent",
  DropdownMenuContent: "DropdownMenuPrimitive.Content",
  DropdownMenuGroup: "DropdownMenuPrimitive.Group",
  DropdownMenuItem: "DropdownMenuPrimitive.Item",
  DropdownMenuCheckboxItem: "DropdownMenuPrimitive.CheckboxItem",
  DropdownMenuRadioItem: "DropdownMenuPrimitive.RadioItem",
  DropdownMenuLabel: "DropdownMenuPrimitive.Label",
  DropdownMenuRadioGroup: "DropdownMenuPrimitive.RadioGroup",
  DropdownMenuSeparator: "DropdownMenuPrimitive.Separator",
  Label: "LabelPrimitive.Root",
  PopoverTrigger: "PopoverPrimitive.Trigger",
  PopoverContent: "PopoverPrimitive.Content",
  PopoverAnchor: "PopoverPrimitive.Anchor",
  SelectGroup: "SelectPrimitive.Group",
  SelectValue: "SelectPrimitive.Value",
  SelectTrigger: "SelectPrimitive.Trigger",
  SelectScrollUpButton: "SelectPrimitive.ScrollUpButton",
  SelectScrollDownButton: "SelectPrimitive.ScrollDownButton",
  SelectContent: "SelectPrimitive.Content",
  SelectLabel: "SelectPrimitive.Label",
  SelectItem: "SelectPrimitive.Item",
  SelectSeparator: "SelectPrimitive.Separator",
  Separator: "SeparatorPrimitive.Root",
  Switch: "SwitchPrimitive.Root",
  Tabs: "TabsPrimitive.Root",
  TabsList: "TabsPrimitive.List",
  TabsTrigger: "TabsPrimitive.Trigger",
  TabsContent: "TabsPrimitive.Content",
  Toggle: "TogglePrimitive.Root",
  TooltipTrigger: "TooltipPrimitive.Trigger",
  TooltipContent: "TooltipPrimitive.Content",
};
export function forwardRefs(text) {
  const source = ts.createSourceFile(
    "component.tsx",
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits = [];
  for (const statement of source.statements) {
    if (
      !ts.isFunctionDeclaration(statement) ||
      !statement.name ||
      !statement.body
    )
      continue;
    const name = statement.name.text;
    const primitive = primitives[name];
    const native = {
      Button: "button",
      Input: "input",
      Textarea: "textarea",
      Card: "div",
    }[name];
    if (!primitive && !native) continue;
    const parameter = statement.parameters[0];
    if (!parameter?.type)
      throw new Error(`Missing source props type for ${name}`);
    const type = primitive ? `typeof ${primitive}` : `'${native}'`;
    const tag = primitive ?? (name === "Button" ? "Comp" : native);
    let body = statement.body.getText(source);
    const opening = new RegExp(`<${tag.replaceAll(".", "\\.")}\\b`);
    if (!opening.test(body)) throw new Error(`Missing ref target for ${name}`);
    body = body.replace(opening, `$& ref={ref}`);
    const replacement = `const ${name} = React.forwardRef<React.ComponentRef<${type}>, Omit<${parameter.type.getText(source)}, 'ref'>>(function ${name}(${parameter.name.getText(source)}, ref) ${body});`;
    edits.push({
      start: statement.getStart(source),
      end: statement.end,
      replacement,
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    text = text.slice(0, edit.start) + edit.replacement + text.slice(edit.end);
  return text;
}
