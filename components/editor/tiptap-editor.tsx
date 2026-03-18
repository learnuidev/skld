"use client";

import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGenerateUploadUrlMutation } from "@/modules/assets/use-generate-upload-url-mutation";
import { useCreateAssetMutation } from "@/modules/assets/use-create-asset-mutation";
import { CustomImage } from "./extensions/custom-image";
import {
  getAssetUrlApi,
  useGetAssetQuery,
} from "@/modules/assets/use-get-asset-query";

interface TiptapEditorProps {
  content: string;
  editable: boolean;
  onUpdate: (content: any) => void;
}

export function TiptapEditor({
  content,
  editable,
  onUpdate,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

  const generateUploadUrlMutation = useGenerateUploadUrlMutation();
  const createAssetMutation = useCreateAssetMutation();

  const loadAssetUrl = async (assetId: string) => {
    if (assetUrls[assetId]) {
      return assetUrls[assetId];
    }

    try {
      const asset = await getAssetUrlApi(assetId);

      if (asset?.downloadUrl) {
        setAssetUrls((prev) => ({ ...prev, [assetId]: asset.downloadUrl }));
        return asset.downloadUrl;
      }
    } catch (error) {
      console.error("Failed to fetch asset:", error);
    }

    return "";
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: "font-bold tracking-tight text-foreground scroll-mt-20",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6 space-y-1 my-4 mx-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6 space-y-1 my-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "text-muted-foreground leading-relaxed my-1 mx-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-border pl-4 py-1 my-4 italic text-muted-foreground",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-foreground/80 hover:text-foreground underline underline-offset-2 transition-colors",
        },
      }),
      Underline,
      Markdown,
      CustomImage,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-[15px] lg:text-base leading-[1.8] text-muted-foreground prose-p:mb-4 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:my-4 prose-a:text-foreground/80 hover:prose-a:text-foreground prose-strong:font-semibold prose-strong:text-foreground prose-em:italic prose-em:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-headings:text-foreground prose-headings:font-bold",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const images = editor.$nodes("customImage");
      images?.forEach(({ node }) => {
        const assetId = node.attrs.assetId;
        if (assetId && !assetUrls[assetId] && !node.attrs.src) {
          loadAssetUrl(assetId).then((url) => {
            if (url) {
              editor
                .chain()
                .updateAttributes("customImage", { src: url })
                .run();
            }
          });
        }
      });
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, assetUrls]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      const { uploadUrl, s3Key, id } =
        await generateUploadUrlMutation.mutateAsync({
          fileName: file.name,
          contentType: file.type,
        });

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      const asset = await createAssetMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        s3Key,
      });

      editor
        ?.chain()
        .focus()
        .setCustomImage({
          assetId: asset.id,
          src: "",
        })
        .run();
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="">
      <style>{`
        .ProseMirror h1 {
          font-size: 2.25rem;
          line-height: 1.2;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .ProseMirror h2 {
          font-size: 1.75rem;
          line-height: 1.3;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        .ProseMirror h3 {
          font-size: 1.375rem;
          line-height: 1.4;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ul > li::marker {
          color: hsl(var(--muted-foreground));
          padding-left: 0.25rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror ol > li::marker {
          color: hsl(var(--muted-foreground));
          font-weight: 500;
        }
        .ProseMirror ol > li {
          padding-left: 0.25rem;
        }
        .ProseMirror pre {
          background-color: hsl(var(--muted));
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .ProseMirror code {
          font-size: 0.875rem;
        }
        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          font-size: inherit;
        }
        .ProseMirror :not(pre) > code {
          background-color: hsl(var(--muted));
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        @media (max-width: 640px) {
          .ProseMirror h1 {
            font-size: 1.75rem;
            line-height: 1.25;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .ProseMirror h2 {
            font-size: 1.375rem;
            line-height: 1.35;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .ProseMirror h3 {
            font-size: 1.125rem;
            line-height: 1.45;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1rem;
            margin-left: 0.5rem;
          }
          .ProseMirror ul > li,
          .ProseMirror ol > li {
            font-size: 0.9375rem;
          }
          .ProseMirror pre {
            padding: 0.75rem;
            margin: 0.75rem 0;
            font-size: 0.8125rem;
          }
          .ProseMirror pre code {
            font-size: 0.8125rem;
          }
          .ProseMirror :not(pre) > code {
            padding: 0.0625rem 0.25rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
      {editable && (
        <div className="flex items-center gap-1 px-2 py-2 sticky top-0 z-50 bg-white dark:bg-black flex-wrap">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("bold") ? "bg-accent" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("italic") ? "bg-accent" : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("underline") ? "bg-accent" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("bulletList") ? "bg-accent" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("orderedList") ? "bg-accent" : ""
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              editor.isActive("link") ? "bg-accent" : ""
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={handleImageClick}
            disabled={uploading}
            className={`p-2 rounded hover:bg-accent transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={uploading ? "Uploading..." : "Add Image"}
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
