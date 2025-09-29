import api from './index';

export const getTransactions = async (memberId: string, params?: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  const response = await api.get(`/transactions/${memberId}`, { params });
  return response.data;
};

export const addTransaction = async (memberId: string, transactionData: {
  amount: number;
  type: 'earn' | 'redeem' | 'adjust';
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}) => {
  const response = await api.post(`/transactions/${memberId}`, transactionData);
  return response.data;
};

export const getBalance = async (memberId: string) => {
  const response = await api.get(`/transactions/${memberId}/balance`);
  return response.data;
};
