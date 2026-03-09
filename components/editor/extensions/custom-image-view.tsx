"use client";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useGetAssetQuery } from "@/modules/assets/use-get-asset-query";
import { Image } from "lucide-react";

interface CustomImageNodeViewProps {
  node: {
    attrs: {
      assetId: string;
      src?: string;
      alt?: string;
      title?: string;
    };
  };
  updateAttributes: (attributes: Record<string, any>) => void;
}

export function CustomImageNodeView({
  node,
  updateAttributes,
}: CustomImageNodeViewProps) {
  console.log("YOOO", node);
  const { data: asset, isLoading } = useGetAssetQuery(node.attrs.assetId);

  if (isLoading || !asset) {
    return (
      <NodeViewWrapper className="custom-image-node">
        <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Image className="w-8 h-8 text-muted-foreground animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Loading image...
            </span>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="custom-image-node">
      <div className="my-4">
        <img
          src={asset.downloadUrl || node.attrs.src}
          alt={node.attrs.alt || asset.fileName}
          title={node.attrs.title || asset.fileName}
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    </NodeViewWrapper>
  );
}
