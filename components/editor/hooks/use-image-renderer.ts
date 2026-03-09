"use client";

import { useGetAssetQuery } from "@/modules/assets/use-get-asset-query";
import { useEffect, useState } from "react";

export function useImageRenderer() {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingAssets, setLoadingAssets] = useState<Set<string>>(new Set());

  const preloadImage = (assetId: string) => {
    if (imageUrls[assetId]) {
      return imageUrls[assetId];
    }

    if (loadingAssets.has(assetId)) {
      return "";
    }

    setLoadingAssets((prev) => new Set(prev).add(assetId));

    return "";
  };

  const handleImageLoad = (assetId: string, url: string) => {
    setImageUrls((prev) => ({ ...prev, [assetId]: url }));
    setLoadingAssets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(assetId);
      return newSet;
    });
  };

  return {
    imageUrls,
    loadingAssets,
    preloadImage,
    handleImageLoad,
  };
}
