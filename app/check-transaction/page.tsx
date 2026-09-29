"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { checkPaymentStatus, PaymentStatusResponse } from "../../lib/api";

type UiStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

function CheckTransactionContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tranId") || "";

  const [status, setStatus] = useState<UiStatus>(tranId ? "PENDING" : "FAILED");
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);

  useEffect(() => {
    if (!tranId) return;

    let attempts = 0;
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    const maxPollDuration = 90_000;

    const getDelay = (attempt: number) => {
      if (attempt <= 3) return 2000;
      if (attempt <= 8) return 3000;
      return 5000;
    };

    const poll = async () => {
      if (!isMounted) return;
      attempts += 1;

      try {
        const response = await checkPaymentStatus(tranId);
        if (!isMounted) return;

        setPayment(response);

        if (response.status === "COMPLETED") {
          setStatus("COMPLETED");
          return;
        }

        if (response.status === "CANCELLED") {
          setStatus("CANCELLED");
          return;
        }

        setStatus("PENDING");
      } catch (err) {
        console.error("Payment status polling failed:", err);
      }

      if (Date.now() - startedAt >= maxPollDuration) {
        if (isMounted) setStatus("FAILED");
        return;
      }

      if (isMounted) {
        timeoutId = setTimeout(poll, getDelay(attempts));
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tranId]);

  const isPending = status === "PENDING";
  const isCompleted = status === "COMPLETED";

  return (
    <main className="min-h-screen bg-[#0b091f] text-slate-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-8 text-center shadow-2xl shadow-black/40">
        <div
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-5 ${
            isCompleted
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : isPending
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-red-500/20 border-red-500/40 text-red-400"
          }`}
        >
          {isPending ? (
            <RefreshCw className="w-10 h-10 animate-spin" />
          ) : isCompleted ? (
            <Check className="w-10 h-10 stroke-[3]" />
          ) : (
            <AlertCircle className="w-10 h-10" />
          )}
        </div>

        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider mb-3 ${
            isCompleted
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : isPending
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
          }`}
        >
          {isPending
            ? "Verifying payment"
            : isCompleted
              ? "Payment completed"
              : "Payment not completed"}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {isPending
            ? "Processing your payment"
            : isCompleted
              ? "Thank you for your order"
              : "Payment failed"}
        </h1>

        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          {isPending
            ? "Keep this page open while we confirm the ABA PayWay transaction."
            : isCompleted
              ? "Your payment has been verified. Delivery processing will run next."
              : "If you already paid, please contact support with your transaction ID."}
        </p>

        <div className="mt-6 rounded-2xl bg-black/30 border border-white/10 p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">Transaction ID</span>
            <span className="font-mono font-bold text-purple-300 truncate">
              {tranId || "N/A"}
            </span>
          </div>
          {payment?.productName && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Product</span>
              <span className="font-bold text-white text-right truncate">
                {payment.productName}
              </span>
            </div>
          )}
          {payment?.packageName && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Package</span>
              <span className="font-bold text-white text-right truncate">
                {payment.packageName}
              </span>
            </div>
          )}
          {payment?.amount && (
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <span className="text-slate-300 font-bold">Amount</span>
              <span className="font-black text-amber-400">${payment.amount}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 px-5 py-3 text-xs font-black text-white transition-all"
          >
            Back to Store
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckTransactionPage() {
  return (
    <Suspense fallback={null}>
      <CheckTransactionContent />
    </Suspense>
  );
}
