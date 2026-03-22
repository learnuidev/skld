import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CustomImageNodeView } from "./custom-image-view";

export interface CustomImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      setCustomImage: (options: { assetId: string; src: string }) => ReturnType;
    };
  }
}

export const CustomImage = Node.create<CustomImageOptions>({
  name: "customImage",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",

  atom: true,

  inline: false,

  draggable: true,

  addAttributes() {
    return {
      assetId: {
        default: null,
      },
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[data-custom-image]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      "img",
      {
        ...HTMLAttributes,
        "data-custom-image": "true",
        loading: "lazy",
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomImageNodeView);
  },

  addCommands() {
    return {
      setCustomImage:
        (options: any) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
