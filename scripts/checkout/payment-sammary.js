import { cart, clearCart } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { formatMoney } from "../utils/money.js";
import { getDeliveryOption } from "../../data/deliveryOprions.js";
import { addOrder } from "../../data/orders.js";

function generatePaymentHTML() {
  const totals = calculateCartTotals();

  return `
    <div class="payment-summary-title">
      Order Summary
    </div>
    <div class="payment-summary-row">
      <div>Items (${totals.totalItems}):</div>
      <div class="payment-summary-money">$${totals.itemsPriceCents}</div>
    </div>
    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${totals.shippingTotal}</div>
    </div>
    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${totals.totalBeforeTax}</div>
    </div>
    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${totals.taxTotal}</div>
    </div>
    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${totals.orderTotal}</div>
    </div>
    <button class="place-order-button button-primary js-place-order-button">
      Place your order
    </button>
  `;
}

function calculateCartTotals() {
  const taxRate = 0.1;

  const { itemsPriceCents, shippingPriceCents, totalItems } = cart.reduce(
    (totals, cartItem) => {
      const product = getProduct(cartItem.productId);
      const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);

      if (product && deliveryOption) {
        totals.itemsPriceCents += product.priceCents * cartItem.quantity;
        totals.shippingPriceCents += deliveryOption.priceCents;
        totals.totalItems += cartItem.quantity;
      }

      return totals;
    },
    { itemsPriceCents: 0, shippingPriceCents: 0, totalItems: 0 }
  );

  const totalBeforeTax = itemsPriceCents + shippingPriceCents;
  const taxTotal = totalBeforeTax * taxRate;
  const orderTotal = totalBeforeTax + taxTotal;

  return {
    totalItems,
    itemsPriceCents: formatMoney(itemsPriceCents),
    shippingTotal: formatMoney(shippingPriceCents),
    taxTotal: formatMoney(taxTotal),
    totalBeforeTax: formatMoney(totalBeforeTax),
    orderTotal: formatMoney(orderTotal),
  };
}

async function placeOrder() {
  try {
    const response = await fetch("https://supersimplebackend.dev/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: cart,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to place order");
    }

    const order = await response.json();
    addOrder(order);
    clearCart();

    window.location.href = "orders.html";
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

function setupPlaceOrderButton() {
  const placeOrderButton = document.querySelector(".js-place-order-button");
  if (cart.length === 0) {
    placeOrderButton.disabled = true;
  } else {
    placeOrderButton.addEventListener("click", placeOrder);
  }
}

function updatePaymentSummary() {
  const paymentSummaryElement = document.querySelector(".js-payment-summary");
  if (paymentSummaryElement) {
    paymentSummaryElement.innerHTML = generatePaymentHTML();
    setupPlaceOrderButton();
  }
}

export { updatePaymentSummary, calculateCartTotals };
