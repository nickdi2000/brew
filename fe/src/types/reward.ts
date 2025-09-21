export type RewardType = 'product' | 'service' | 'discount' | 'experience';

export interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: RewardType;
  imageUrl?: string;
  isActive: boolean;
  quantity: number | null;
  expiresAt: string | null;
  organizationId: string;
  redemptionInstructions?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isOutOfStock: boolean;
  isAvailable: boolean;
}

export interface RewardFilters {
  search?: string;
  type?: RewardType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RewardFormData {
  name: string;
  description: string;
  pointsCost: number;
  type: RewardType;
  imageUrl?: string;
  isActive: boolean;
  quantity: number | null;
  expiresAt: string | null;
  redemptionInstructions?: string;
  termsAndConditions?: string;
}

export interface RewardPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface RewardsResponse {
  rewards: Reward[];
  pagination: RewardPagination;
}
