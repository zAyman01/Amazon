import { loadProductsFetch } from "../data/products.js";
import { initializeCart } from "./checkout/cart-sammary.js";
import { updatePaymentSummary } from "./checkout/payment-sammary.js";

async function loadPage() {
  try {
    await loadProductsFetch();
    initializeCart();
    updatePaymentSummary();
  } catch (error) {
    console.error("Error loading page:", error);
  }
}

loadPage();
