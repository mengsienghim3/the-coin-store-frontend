export interface CreatePaymentPayload {
  type: "game" | "gift_card";
  productId: string;
  productName?: string;
  packageId: string;
  packageName?: string;
  amount?: number;
  playerCredentials?: Record<string, string>;
  playerName?: string | null;
  contactInfo?: string | null;
}

export interface PaymentOrderResponse {
  orderId: string;
  tranId: string;
  qrImage?: string;
  qrString?: string;
  deeplink?: string;
  amount: string;
  currency: string;
  productName: string;
  packageName: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  expiresInSeconds?: number;
  isSandbox?: boolean;
  paywayPayment?: PayWayPaymentModel;
}

export interface PayWayPaymentModel {
  actionUrl: string;
  req_time: string;
  merchant_id: string;
  tran_id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  amount: number;
  currency: string;
  payment_option: string;
  return_url: string;
  continue_success_url: string;
  view_type: string;
  skip_success_page: number;
  payment_gate: number;
  lifetime: number;
  hash: string;
}

export interface PaymentStatusResponse {
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  tranId: string;
  orderId?: string;
  amount?: string;
  productName?: string;
  packageName?: string;
  playerName?: string | null;
  apv?: string;
  createdAt?: string;
  message?: string;
}
