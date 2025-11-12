export interface QRCode {
  _id: string;
  code: string;
  name: string;
  points?: number; // Optional for backward compatibility with organization QR codes
  isActive?: boolean; // Optional for backward compatibility
  organizationId?: string | null;
  organization?: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null; // Optional for backward compatibility
  printed?: boolean; // Optional for backward compatibility
  type?: string;
  qrContent?: string; // Optional for backward compatibility
  value?: string; // Optional for backward compatibility
  status?: 'draft' | 'printed' | 'ordered' | 'in-hand' | 'delivered' | 'claimed';
  deliveryDescription?: string;
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

export interface SuperQRCodeFormData {
  status: 'draft' | 'printed' | 'ordered' | 'in-hand' | 'delivered';
  code?: string;
  name?: string;
  type?: string;
  organization?: string | null;
  deliveryDescription?: string;
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
