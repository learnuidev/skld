"use client";

import { useGetAssetQuery } from "@/modules/assets/use-get-asset-query";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Image } from "lucide-react";

export function CustomImageNodeView({ node }: ReactNodeViewProps) {
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
