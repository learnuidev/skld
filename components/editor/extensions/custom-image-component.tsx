"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { useGetAssetQuery } from "@/modules/assets/use-get-asset-query";
import { Image as ImageIcon, Loader2 } from "lucide-react";

interface CustomImageComponentProps {
  assetId: string;
  alt?: string;
  title?: string;
}

export function CustomImageComponent({
  assetId,
  alt,
  title,
}: CustomImageComponentProps) {
  const { data: asset, isLoading } = useGetAssetQuery(assetId);

  if (isLoading || !asset) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg my-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">
            Loading image...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <img
        src={asset.downloadUrl}
        alt={alt || asset.fileName}
        title={title || asset.fileName}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
}
