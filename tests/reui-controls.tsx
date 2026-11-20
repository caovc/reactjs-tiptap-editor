import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import "../lib/style.css";

import { Toaster } from "../src/components/reui/sonner";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../src/components/reui";
import { useToast } from "../src/components/notifications";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../src/components/reui/dialog";
import { RESET_CSS } from "../src/constants/resetCSS";
import { ThemeColorReactive } from "../src/store/ThemeColorReactive";
import { themeActions } from "../src/theme/theme";

function Controls() {
  const [choice, setChoice] = useState("one");
  const [result, setResult] = useState("idle");
  const { toast, dismiss } = useToast();
  const notification = useRef<ReturnType<typeof toast> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [refStatus, setRefStatus] = useState("pending");
  useEffect(() => {
    setRefStatus(
      inputRef.current instanceof HTMLInputElement &&
        buttonRef.current instanceof HTMLButtonElement
        ? "forwarded"
        : "missing",
    );
  }, []);
  return (
    <div className="reactjs-tiptap-editor">
      <style>{RESET_CSS}</style>
      <ThemeColorReactive />
      <TooltipProvider delayDuration={0}>
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="ReUI" ref={inputRef} />
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" />
        <Label htmlFor="check">Enabled</Label>
        <Checkbox id="check" />
        <Label htmlFor="switch">Notifications</Label>
        <Switch id="switch" />
        <Toggle aria-label="Mark">Mark</Toggle>
        <Separator decorative={false} />
        <Select value={choice} onValueChange={setChoice}>
          <SelectTrigger aria-label="Choice">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="one">One</SelectItem>
              <SelectItem value="two">Two</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setResult("selected")}>
                Select action
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">Popover</Button>
          </PopoverTrigger>
          <PopoverContent aria-label="Details">Popover details</PopoverContent>
        </Popover>
        <Dialog>
          <DialogTrigger asChild>
            <Button ref={buttonRef}>Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Control dialog</DialogTitle>
            <DialogDescription>
              Keyboard and focus verification.
            </DialogDescription>
            <Input aria-label="Dialog input" />
          </DialogContent>
        </Dialog>
        <Tabs defaultValue="first">
          <TabsList>
            <TabsTrigger value="first">First</TabsTrigger>
            <TabsTrigger value="second">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="first">First panel</TabsContent>
          <TabsContent value="second">Second panel</TabsContent>
        </Tabs>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost">Hint</Button>
          </TooltipTrigger>
          <TooltipContent>Helpful hint</TooltipContent>
        </Tooltip>
        <Button
          onClick={() =>
            (notification.current = toast({
              title: "Notification delivered",
              description: "ReUI Sonner",
              variant: "destructive",
            }))
          }
        >
          Notify
        </Button>
        <Button
          onClick={() =>
            notification.current?.update({ title: "Notification updated" })
          }
        >
          Update notification
        </Button>
        <Button
          onClick={() =>
            notification.current && dismiss(notification.current.id)
          }
        >
          Dismiss notification
        </Button>
        <output aria-label="Ref result">{refStatus}</output>
        <Button variant="primary" mode="link">
          Link button
        </Button>
        <Button disabled>Disabled</Button>
        <Button onClick={() => themeActions.setTheme("dark")}>
          Dark theme
        </Button>
        <Button onClick={() => themeActions.setTheme("light")}>
          Light theme
        </Button>
        <output aria-label="Menu result">{result}</output>
        <div data-richtext-portal>
          <Toaster />
        </div>
      </TooltipProvider>
    </div>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("Missing fixture root");
createRoot(root).render(<Controls />);
