export interface Transaction {
  _id: string;
  memberId: string;
  organizationId: string;
  amount: number;
  type: 'earn' | 'redeem' | 'adjust';
  method?: 'manual' | 'redemption';
  reward?: string;
  performedBy?: string;
  metadata?: {
    description?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}
