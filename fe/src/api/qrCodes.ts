import api from './index';
import type { QRCode, QRCodeFormData, QRCodeResponse, QRCodesResponse } from '@/types/qrCode';

export const qrCodesApi = {
  /**
   * Get all QR codes for the organization
   */
  getQRCodes: async (): Promise<QRCode[]> => {
    const { data } = await api.get('/qr-codes');
    return data.data;
  },

  /**
   * Create a new QR code
   */
  createQRCode: async (qrData: QRCodeFormData): Promise<QRCode> => {
    const { data } = await api.post('/qr-codes', qrData);
    return data.data;
  },

  /**
   * Update an existing QR code
   */
  updateQRCode: async (id: string, qrData: Partial<QRCodeFormData>): Promise<QRCode> => {
    const { data } = await api.put(`/qr-codes/${id}`, qrData);
    return data.data;
  },

  /**
   * Delete a QR code
   */
  deleteQRCode: async (id: string): Promise<void> => {
    await api.delete(`/qr-codes/${id}`);
  }
};
