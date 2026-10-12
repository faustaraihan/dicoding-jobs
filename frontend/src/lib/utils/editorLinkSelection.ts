import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

interface LinkRange {
  from: number;
  to: number;
}

export const linkSelectionKey = new PluginKey<LinkRange | null>("linkSelection");

export const LinkSelection = Extension.create({
  name: "linkSelection",
  addProseMirrorPlugins() {
    return [
      new Plugin<LinkRange | null>({
        key: linkSelectionKey,
        state: {
          init: () => null,
          apply(transaction, range) {
            const next = transaction.getMeta(linkSelectionKey) as LinkRange | null | undefined;
            if (next !== undefined) return next;
            if (!range) return null;
            if (transaction.selectionSet) {
              return { from: transaction.selection.from, to: transaction.selection.to };
            }
            return {
              from: transaction.mapping.map(range.from),
              to: transaction.mapping.map(range.to),
            };
          },
        },
        props: {
          decorations(state) {
            const range = linkSelectionKey.getState(state);
            if (!range || range.from === range.to) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.inline(range.from, range.to, { class: "editor-link-selection" }),
            ]);
          },
        },
      }),
    ];
  },
});
