import { orders } from "../data/orders.js";
import { formatMoney } from "./utils/money.js";
import { getProduct, loadProductsFetch, products } from "../data/products.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { updateCartQuantity } from "./amazon.js";
import { addToCart } from "../data/cart.js";
import "./utils/search.js";

async function renderOrders() {
  if (!products.length) {
    await loadProductsFetch();
  }

  let ordersHTML = "";

  orders.forEach((order) => {
    let orderItemsHTML = "";

    order.products.forEach((product) => {
      const productDetails = getProduct(product.productId);

      if (!productDetails) {
        console.error(
          `❌ Product details not found for ID: ${product.productId}`
        );
        return;
      }

      orderItemsHTML += `
        <div class="order-details-grid">
          <div class="product-image-container">
            <img src="${productDetails.image}" alt="${productDetails.name}">
          </div>

          <div class="product-details">
            <div class="product-name">${productDetails.name}</div>
            <div class="product-delivery-date">
              Arriving on: ${dayjs(product.estimatedDeliveryTime).format(
                "dddd, MMMM D"
              )}
            </div>
            <div class="product-quantity">Quantity: ${product.quantity}</div>
            <button class="buy-again-button button-primary" data-product-id="${
              product.productId
            }">
              <img class="buy-again-icon" src="images/icons/buy-again.png">
              <span class="buy-again-message">Buy it again</span>
            </button>
          </div>

          <div class="product-actions">
            <a href="tracking.html?order-id=${order.id}&product-id=${ product.productId }">
              <button class="track-package-button button-secondary">Track package</button>
            </a>
          </div>
        </div>
      `;
    });

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${dayjs(order.orderTime).format("dddd, MMMM D")}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatMoney(order.totalCostCents)}</div>
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        ${orderItemsHTML}
      </div>
    `;
  });

  const ordersContainer = document.querySelector(".orders-grid");
  if (ordersContainer) {
    ordersContainer.innerHTML = ordersHTML;

    document.querySelectorAll(".buy-again-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const productId =
          event.target.closest(".buy-again-button").dataset.productId;
        addToCart(productId);
        updateCartQuantity();

        button.innerHTML = `
            <span class="buy-again-message">✔ Added </span>`;

        setInterval(() => {
          button.innerHTML = `
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>`;
        }, 1500);
      });
    });
  } else {
    console.error("❌ Could not find `.orders-grid` element in the DOM.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrders().then(() => updateCartQuantity());
});
