import DragHandle from "@tiptap/extension-drag-handle-react";
import { TextSelection } from "@tiptap/pm/state";
import { Fragment } from "@tiptap/pm/model";
import { closeHistory } from "@tiptap/pm/history";
import React, { useCallback, useEffect, useState } from "react";

import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  IconComponent,
} from "@/components";
import { Clear } from "@/extensions/Clear";
import { Indent } from "@/extensions/Indent";
import { TextAlign } from "@/extensions/TextAlign";
import { useLocale } from "@/locales";
import { useEditorInstance } from "@/store/editor";
import { useEditableEditor } from "@/store/store";
import { IndentProps, setNodeIndentMarkup } from "@/utils/indent";

import type {} from "@tiptap/extension-paragraph";
import type { Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

export function RichTextBubbleMenuDragHandle({
  transformCopiedNode,
}: { transformCopiedNode?: (node: JSONContent) => JSONContent } = {}) {
  const editor = useEditorInstance();
  const editable = useEditableEditor();

  const { t } = useLocale();
  const [currentNode, setCurrentNode] = useState<
    import("@tiptap/pm/model").Node | null
  >(null);
  const [currentNodePos, setCurrentNodePos] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasTextAlignExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === TextAlign.name,
  );
  const hasIndentExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === Indent.name,
  );
  const hasClearExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === Clear.name,
  );

  function resetTextFormatting() {
    const chain = editor.chain();
    chain.setNodeSelection(currentNodePos).unsetAllMarks();
    if (currentNode?.type.name !== "paragraph") {
      chain.setParagraph();
    }
    chain.run();
  }
  function copyNodeToClipboard() {
    editor.chain().focus().setNodeSelection(currentNodePos).run();
    document.execCommand("copy");
  }
  function runBlockAction(action: () => void) {
    editor.view.dispatch(closeHistory(editor.state.tr));
    action();
    editor.view.dispatch(closeHistory(editor.state.tr));
  }
  function duplicateNode() {
    const node = editor.state.doc.nodeAt(currentNodePos);
    if (!node) return;
    const json = node.toJSON();
    runBlockAction(() => {
      editor
        .chain()
        .setMeta("hideDragHandle", true)
        .insertContentAt(
          currentNodePos + node.nodeSize,
          transformCopiedNode ? transformCopiedNode(json) : json,
        )
        .run();
    });
  }
  function setTextAlign(alignments: string) {
    editor.commands.setTextAlign(alignments);
  }
  function increaseIndent() {
    const indentTr = setNodeIndentMarkup(editor.state.tr, currentNodePos, 1);
    indentTr.setMeta("hideDragHandle", true);
    if (editor.view.dispatch) editor.view.dispatch(indentTr);
  }
  function decreaseIndent() {
    const tr = setNodeIndentMarkup(editor.state.tr, currentNodePos, -1);
    if (editor.view.dispatch) editor.view.dispatch(tr);
  }

  function deleteNode() {
    runBlockAction(() => {
      editor
        .chain()
        .setMeta("hideDragHandle", true)
        .setNodeSelection(currentNodePos)
        .deleteSelection()
        .run();
    });
  }

  function moveBlock(direction: "up" | "down") {
    const { doc } = editor.state;
    const tr = closeHistory(editor.state.tr);
    const node = doc.nodeAt(currentNodePos);
    if (!node) return;
    const before = doc.resolve(currentNodePos).nodeBefore;
    const after = doc.resolve(currentNodePos + node.nodeSize).nodeAfter;
    const neighbor = direction === "up" ? before : after;
    if (!neighbor) return;
    const from =
      direction === "up" ? currentNodePos - neighbor.nodeSize : currentNodePos;
    const to =
      direction === "up"
        ? currentNodePos + node.nodeSize
        : currentNodePos + node.nodeSize + neighbor.nodeSize;
    tr.replaceWith(
      from,
      to,
      Fragment.fromArray(
        direction === "up" ? [node, neighbor] : [neighbor, node],
      ),
    );
    const destination = direction === "up" ? from : from + neighbor.nodeSize;
    tr.setSelection(TextSelection.near(tr.doc.resolve(destination + 1)));
    tr.setMeta("hideDragHandle", true);
    editor.view.dispatch(tr.scrollIntoView());
    editor.view.dispatch(closeHistory(editor.state.tr));
    editor.view.focus();
  }
  function insertParagraph(before: boolean) {
    if (!currentNode) return;
    const pos = before ? currentNodePos : currentNodePos + currentNode.nodeSize;
    runBlockAction(() => {
      editor
        .chain()
        .insertContentAt(pos, { type: "paragraph" })
        .focus(pos + 1)
        .run();
    });
  }

  const handleNodeChange = useCallback(
    (data: { node: Node | null; editor: Editor; pos: number }) => {
      if (data.node) {
        setCurrentNode(data.node);
      }
      setCurrentNodePos(data.pos);
    },
    [],
  );

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentNodePos !== -1) {
      const currentNodeSize = currentNode?.nodeSize || 0;
      const insertPos = currentNodePos + currentNodeSize;
      const currentNodeIsEmptyParagraph =
        currentNode?.type.name === "paragraph" &&
        currentNode?.content?.size === 0;
      const focusPos = currentNodeIsEmptyParagraph
        ? currentNodePos + 2
        : insertPos + 2;
      editor
        .chain()
        .command(({ dispatch, tr, state }) => {
          if (dispatch) {
            if (currentNodeIsEmptyParagraph) {
              tr.insertText("/", currentNodePos + 1);
            } else {
              tr.insert(
                insertPos,
                state.schema.nodes.paragraph.create(null, [
                  state.schema.text("/"),
                ]),
              );
            }

            return dispatch(tr);
          }

          return true;
        })
        .focus(focusPos)
        .run();
    }
  };

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta("lockDragHandle", true);
    } else {
      editor.commands.setMeta("lockDragHandle", false);
    }

    return () => {
      editor.commands.setMeta("lockDragHandle", false);
    };
  }, [menuOpen]);

  const handleMenuOpenChange = (open: boolean) => {
    if (!editable) {
      return;
    }
    setMenuOpen(open);
  };

  return (
    <DragHandle
      className="richtext-block-handle richtext-transition-all richtext-duration-200 richtext-ease-out"
      editor={editor}
      nested={{
        defaultRules: false,
        edgeDetection: "none",
        rules: [
          {
            id: "document-blocks",
            evaluate: ({ depth, node }) =>
              depth === 1 && node.isBlock ? 0 : 1000,
          },
        ],
      }}
      onElementDragStart={() =>
        editor.view.dispatch(closeHistory(editor.state.tr))
      }
      onElementDragEnd={() =>
        editor.view.dispatch(closeHistory(editor.state.tr))
      }
      onNodeChange={handleNodeChange}
      pluginKey={"RichTextBubbleMenuDragHandle"}
    >
      <div
        className="richtext-flex richtext-items-center richtext-gap-0.5"
        data-richtext-portal
        data-block-handle
      >
        <ActionButton
          action={handleAdd}
          disabled={!editable}
          icon="Plus"
          tooltip={t("editor.draghandle.insertBlock")}
        />

        <ActionButton
          disabled={!editable}
          icon="Grip"
          draggable={true}
          preserveSelection={false}
          tooltip={t("editor.draghandle.grip")}
          action={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMenuOpenChange(!menuOpen);
          }}
        />

        <DropdownMenu onOpenChange={handleMenuOpenChange} open={menuOpen}>
          <DropdownMenuTrigger className="richtext-pointer-events-none" />

          <DropdownMenuContent
            align="start"
            className="richtext-w-48"
            hideWhenDetached
            side="bottom"
            sideOffset={0}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="richtext-flex richtext-gap-3 richtext-bg-opacity-10 hover:richtext-bg-red-400 hover:richtext-bg-opacity-20 focus:richtext-bg-red-400 focus:richtext-bg-opacity-30 focus:richtext-text-red-500 dark:hover:richtext-bg-opacity-20 dark:hover:richtext-text-red-500"
                onClick={deleteNode}
              >
                <IconComponent name="Trash2" />

                <span>{t("editor.remove")}</span>
              </DropdownMenuItem>

              {hasClearExtension ? (
                <DropdownMenuItem
                  className="richtext-flex richtext-gap-3"
                  onClick={resetTextFormatting}
                >
                  <IconComponent name="PaintRoller" />

                  <span>{t("editor.clear.tooltip")}</span>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem
                className="richtext-flex richtext-gap-3"
                onClick={copyNodeToClipboard}
              >
                <IconComponent name="Clipboard" />

                <span>{t("editor.copyToClipboard")}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="richtext-flex richtext-gap-3"
                onClick={duplicateNode}
              >
                <IconComponent name="Copy" />

                <span>{t("editor.copy")}</span>
              </DropdownMenuItem>

              {hasTextAlignExtension || hasIndentExtension ? (
                <DropdownMenuSeparator />
              ) : null}

              {hasTextAlignExtension ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="richtext-flex richtext-gap-3">
                    <IconComponent name="AlignCenter" />

                    <span>{t("editor.textalign.tooltip")}</span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        className="richtext-flex richtext-gap-3"
                        onClick={() => setTextAlign("left")}
                      >
                        <IconComponent name="AlignLeft" />

                        <span>{t("editor.textalign.left.tooltip")}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="richtext-flex richtext-gap-3"
                        onClick={() => setTextAlign("center")}
                      >
                        <IconComponent name="AlignCenter" />

                        <span>{t("editor.textalign.center.tooltip")}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="richtext-flex richtext-gap-3"
                        onClick={() => setTextAlign("right")}
                      >
                        <IconComponent name="AlignRight" />

                        <span>{t("editor.textalign.right.tooltip")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}

              {hasIndentExtension ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="richtext-flex richtext-gap-3">
                    <IconComponent name="IndentIncrease" />

                    <span>{t("editor.indent")}</span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        className="richtext-flex richtext-gap-3"
                        disabled={currentNode?.attrs?.indent >= IndentProps.max}
                        onClick={increaseIndent}
                      >
                        <IconComponent name="IndentIncrease" />

                        <span>{t("editor.indent.tooltip")}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="richtext-flex richtext-gap-3"
                        disabled={currentNode?.attrs?.indent <= IndentProps.min}
                        onClick={decreaseIndent}
                      >
                        <IconComponent name="IndentDecrease" />

                        <span>{t("editor.outdent.tooltip")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => insertParagraph(true)}>
                {t("editor.draghandle.insertBefore")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => insertParagraph(false)}>
                {t("editor.draghandle.insertAfter")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={currentNodePos <= 0}
                onSelect={() => moveBlock("up")}
              >
                {t("editor.draghandle.moveUp")}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={
                  !currentNode ||
                  currentNodePos + currentNode.nodeSize >=
                    editor.state.doc.content.size
                }
                onSelect={() => moveBlock("down")}
              >
                {t("editor.draghandle.moveDown")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!currentNode?.isTextblock}
                onSelect={() =>
                  runBlockAction(() => {
                    editor
                      .chain()
                      .focus()
                      .setTextSelection(currentNodePos + 1)
                      .setParagraph()
                      .run();
                  })
                }
              >
                {t("editor.draghandle.paragraph")}
              </DropdownMenuItem>
              {editor.schema.nodes.heading && (
                <DropdownMenuItem
                  disabled={!currentNode?.isTextblock}
                  onSelect={() =>
                    runBlockAction(() => {
                      editor
                        .chain()
                        .focus()
                        .setTextSelection(currentNodePos + 1)
                        .setHeading({ level: 2 })
                        .run();
                    })
                  }
                >
                  {t("editor.draghandle.heading")}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}
