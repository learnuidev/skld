"use client";

import { useEffect, useRef, useState } from "react";
import { useGetAssetQuery } from "@/modules/assets/use-get-asset-query";

interface ImageRendererProps {
  content: string;
}

export function ImageRenderer({ content }: ImageRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedAssets, setProcessedAssets] = useState<Set<string>>(
    new Set(),
  );
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [assetMetadata, setAssetMetadata] = useState<
    Record<string, { alt?: string; title?: string }>
  >({});

  const updateImage = async (assetId: string) => {
    if (processedAssets.has(assetId) || !assetId) return;

    try {
      const { data: asset } = await fetch(`/api/assets/${assetId}`).then(
        (res) => res.json(),
      );

      if (asset?.downloadUrl) {
        setAssetUrls((prev) => ({ ...prev, [assetId]: asset.downloadUrl }));
        setAssetMetadata((prev) => ({
          ...prev,
          [assetId]: { alt: asset.fileName, title: asset.fileName },
        }));
        setProcessedAssets((prev) => new Set(prev).add(assetId));
      }
    } catch (error) {
      console.error("Failed to fetch asset:", error);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll(
      "img[data-asset-id]",
    ) as NodeListOf<HTMLImageElement>;

    images.forEach((img) => {
      const assetId = img.getAttribute("data-asset-id");
      if (assetId) {
        updateImage(assetId);
      }
    });
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll(
      "img[data-asset-id]",
    ) as NodeListOf<HTMLImageElement>;

    images.forEach((img) => {
      const assetId = img.getAttribute("data-asset-id");
      if (assetId && assetUrls[assetId]) {
        img.src = assetUrls[assetId];
        const metadata = assetMetadata[assetId];
        if (metadata) {
          if (metadata.alt) img.alt = metadata.alt;
          if (metadata.title) img.title = metadata.title;
        }
      }
    });
  }, [assetUrls, assetMetadata]);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: content }} />
  );
}
