export interface QRCode {
  _id: string;
  code: string;
  name: string;
  points: number;
  isActive: boolean;
  organizationId?: string | null;
  organization?: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  printed?: boolean;
  type?: string;
  qrContent?: string;
  value?: string;
}

export interface QRCodeFormData {
  points: number;
  isActive: boolean;
  code?: string;
  name?: string;
  printed?: boolean;
  type?: string;
  qrContent?: string;
  expiresAt?: string | null;
}

export interface SuperQRCodeFormData extends QRCodeFormData {
  organization?: string | null;
}

export interface QRCodeResponse {
  success: boolean;
  message: string;
  data: QRCode;
}

export interface QRCodesResponse {
  success: boolean;
  message: string;
  data: QRCode[];
}
