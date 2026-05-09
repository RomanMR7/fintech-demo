export type UiOrder = {
  id: string;
  externalId: string;
  merchantId: string;
  merchantName: string;
  providerName: string;
  requisite?: string | null;
  amount: number;
  currency: string;
  status: string;
  commission: number;
  merchantNet: number;
  createdAt: string;
};

export type UiPayout = {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
  recipient: string;
  commission: number;
  sourceBalance: string;
  createdAt: string;
};

export type UiAppeal = {
  id: string;
  orderId: string;
  orderExternalId: string;
  merchantId: string;
  merchantName: string;
  reason: string;
  status: string;
  author: string;
  assignee: string;
  frozenAmount: number;
  decision?: string | null;
  createdAt: string;
  comments: Array<{ id: string; authorRole: string; message: string; createdAt: string }>;
};
