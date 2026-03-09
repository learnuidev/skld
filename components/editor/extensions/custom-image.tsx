import { Node } from "@tiptap/core";

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
    return ({ node }: any) => {
      const img = document.createElement("img");

      img.setAttribute("data-custom-image", "true");
      img.setAttribute("loading", "lazy");

      const attrs = node.attrs;
      if (attrs.alt) img.setAttribute("alt", attrs.alt);
      if (attrs.title) img.setAttribute("title", attrs.title);
      if (attrs.width) img.setAttribute("width", attrs.width);
      if (attrs.height) img.setAttribute("height", attrs.height);

      img.setAttribute("data-asset-id", attrs.assetId);

      return {
        dom: img,
      };
    };
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
