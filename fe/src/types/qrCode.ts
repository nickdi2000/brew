export interface QRCode {
  _id: string;
  points: number;
  code: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeFormData {
  points: number;
  isActive: boolean;
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
