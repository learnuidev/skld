export interface Asset {
  id: string;
  fileName: string;
  contentType: string;
  s3Key: string;
  userId: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  downloadUrl?: string;
}

export interface CreateAssetParams {
  fileName: string;
  contentType: string;
  s3Key?: string;
}
