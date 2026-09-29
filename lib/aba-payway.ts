import type { PayWayPaymentModel } from "./api";

// declare global {
//   interface Window {
//     jQuery?: unknown;
//     $?: unknown;
//     AbaPayway?: {
//       checkout: () => void;
//       closeCheckoutByContinueUrl?: () => void;
//     };
//   }
// }

export const abaHtmlForm = (payment: PayWayPaymentModel) => {
  const input = (name: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return "";
    return `<input type="hidden" name="${name}" value="${value}" />`;
  };

  return `<form
        style="display: none"
        target="aba_webservice"
        id="aba_merchant_request"
        method="POST"
        enctype="multipart/form-data"
        action="${payment.actionUrl}"
      >
        <div class="mb-3">
          ${input("req_time", payment.req_time)}
          ${input("merchant_id", payment.merchant_id)}
          ${input("tran_id", payment.tran_id)}
          ${input("firstname", payment.firstname)}
          ${input("lastname", payment.lastname)}
          ${input("email", payment.email)}
          ${input("phone", payment.phone)}
          <input type="radio" class="payment_option" name="payment_option" value="${payment.payment_option}" checked style="display: none" />
          ${input("amount", payment.amount)}
          ${input("currency", payment.currency)}
          ${input("return_url", payment.return_url)}
          ${input("skip_success_page", payment.skip_success_page)}
          ${input("continue_success_url", payment.continue_success_url)}
          ${input("view_type", payment.view_type)}
          ${input("payment_gate", payment.payment_gate)}
          ${input("lifetime", payment.lifetime)}
          ${input("hash", payment.hash)}
        </div>
        <div class="mb-3">
          <button type="button" id="checkout_button" class="btn btn-primary mb-3">
            Checkout
          </button>
        </div>
      </form>`;
};

export default async function openABAPopup(payment: PayWayPaymentModel) {
  const html = abaHtmlForm(payment);

  const div = document.createElement("div");
  div.setAttribute("id", "Div1");
  div.innerHTML = html;

  document.body.appendChild(div);

  const form = document.getElementById("aba_merchant_request");
  const checkedOption = document.querySelector(".payment_option:checked");

  if (form && checkedOption && checkedOption.parentElement !== form) {
    form.appendChild(checkedOption);
  }

  // @ts-expect-error - AbaPayway is a global object injected by ABA Payway SDK
  AbaPayway.checkout();
}
