"use server";

import {
  checkPaymentStatus,
  createPaymentOrder,
  simulateSandboxPayment,
} from "../../games/[id]/actions";
import { apiGet } from "../../core/http.request.core";
import type { GiftCard } from "../../models/gift-card.model";
import type {
  CreatePaymentPayload,
  PaymentOrderResponse,
  PaymentStatusResponse,
} from "../../models/payment.model";

export async function fetchGiftCard(idOrSlug: string): Promise<GiftCard | null> {
  const response = await apiGet<GiftCard>(`/gift-cards/${idOrSlug}`);
  return response.success ? response.data : null;
}

export async function createGiftCardPaymentOrder(
  payload: CreatePaymentPayload,
): Promise<PaymentOrderResponse> {
  return createPaymentOrder(payload);
}

export async function checkGiftCardPaymentStatus(
  tranId: string,
): Promise<PaymentStatusResponse> {
  return checkPaymentStatus(tranId);
}

export async function simulateGiftCardSandboxPayment(
  tranId: string,
): Promise<PaymentStatusResponse> {
  return simulateSandboxPayment(tranId);
}
