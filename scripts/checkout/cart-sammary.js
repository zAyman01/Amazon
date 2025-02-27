import {
  cart,
  deleteCartItem,
  saveToStorage,
  updateCartItemQuantity,
  updateDeliveryOption,
} from "../../data/cart.js";
import { getProduct, products } from "../../data/products.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import {
  deliveryOptions,
  getDeliveryOption,
} from "../../data/deliveryOprions.js";
import "../../data/cart-class.js";
import { updatePaymentSummary } from "./payment-sammary.js";

function generatePaymentSummaryHTML(cartItem, matchingProduct) {
  const deliveryOptionId = cartItem.deliveryOptionId;
  let deliveryOption = getDeliveryOption(deliveryOptionId);

  const today = dayjs();
  const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
  const dateString = deliveryDate.format("dddd, MMMM D");

  return `
    <div class="cart-item-container js-cart-item-${matchingProduct.id}">
      <div class="delivery-date">Delivery date: ${dateString}</div>
      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">
        <div class="cart-item-details">
          <div class="product-name">${matchingProduct.name}</div>
          <div class="product-price">$${matchingProduct.getPrice()}</div>
          <div class="product-quantity">
            <span>Quantity: <span class="quantity-label js-quantity-label">${
              cartItem.quantity
            }</span></span>
            <span class="update-quantity-link link-primary js-update-quantity-link" data-product-id="${
              matchingProduct.id
            }">Update</span>
            <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${
              matchingProduct.id
            }">Delete</span>
          </div>
        </div>
        <div class="delivery-options">
          <div class="delivery-options-title">Choose a delivery option:</div>
          ${generateDeliveryOptionsHTML(cartItem, matchingProduct)}
        </div>
      </div>
    </div>
  `;
}

function generateDeliveryOptionsHTML(cartItem, matchingProduct) {
  let html = "";

  deliveryOptions.forEach((option) => {
    const today = dayjs();
    const deliveryDate = today.add(option.deliveryDays, "days");
    const dateString = deliveryDate.format("dddd, MMMM D");
    const priceString =
      option.priceCents === 0
        ? "FREE"
        : `$${(option.priceCents / 100).toFixed(2)} - `;
    const isChecked = option.id === cartItem.deliveryOptionId;

    html += `
      <div class="delivery-option">
        <input type="radio" class="delivery-option-input js-delivery-option-input"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${option.id}"
        ${isChecked ? "checked" : ""} 
        name="delivery-option-${
          matchingProduct.id
        }" data-date="${dateString}" data-price="${priceString}">
        <div>
          <div class="delivery-option-date">${dateString}</div>
          <div class="delivery-option-price">${priceString} Shipping</div>
        </div>
      </div> `;
  });

  return html;
}

function updateShippingDate(productId, selectedDate) {
  const cartItemContainer = document.querySelector(
    `.js-cart-item-${productId}`
  );

  if (cartItemContainer) {
    const deliveryDateEl = cartItemContainer.querySelector(".delivery-date");
    deliveryDateEl.textContent = `Delivery date: ${selectedDate}`;
  }
}

function updateCartSummary() {
  const cartSummaryHTML = cart
    .map((cartItem) => {
      const matchingProduct = products.find(
        (product) => product.id === cartItem.productId
      );
      return generatePaymentSummaryHTML(cartItem, matchingProduct);
    })
    .join("");

  document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;
}

function updateCheckoutNumber() {
  const checkoutNumberEl = document.querySelector(".js-item-numbers");
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  checkoutNumberEl.innerHTML = `${totalItems} items`;
  localStorage.setItem("cartQuantity", totalItems);
}

function setupDeleteItemListeners() {
  const deleteQuantityLinks = document.querySelectorAll(
    ".js-delete-quantity-link"
  );

  deleteQuantityLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      deleteCartItem(productId);

      const cartItemContainer = document.querySelector(
        `.js-cart-item-${productId}`
      );
      cartItemContainer.remove();
      updateCheckoutNumber();
      updatePaymentSummary();
      checkCart();
    });
  });
}

function setupUpdateQuantityLinks() {
  const updateQuantityLinksEl = document.querySelectorAll(
    ".js-update-quantity-link"
  );

  updateQuantityLinksEl.forEach((link) => {
    link.addEventListener("click", () => {
      const productContainer = link.closest(".cart-item-container");
      const quantityLabelEl =
        productContainer.querySelector(".js-quantity-label");
      const productId = link.dataset.productId;

      if (link.innerHTML === "Update") {
        link.innerHTML = "Save";
        quantityLabelEl.innerHTML = `
          <input type="number" class="quantity-input" value="${quantityLabelEl.innerHTML}">`;
      } else if (link.innerHTML === "Save") {
        const newQuantityInput =
          productContainer.querySelector(".quantity-input");
        const newQuantity = parseInt(newQuantityInput.value, 10);

        if (newQuantity > 0) {
          link.innerHTML = "Update";
          updateCartItemQuantity(productId, newQuantity);
          quantityLabelEl.innerHTML = `${newQuantity}`;
          saveToStorage();
          updateCheckoutNumber();
          updatePaymentSummary();
        } else {
          alert("Please enter a valid quantity (must be greater than 0).");
          const cartItem = cart.find((item) => item.productId === productId);
          if (cartItem) {
            quantityLabelEl.innerHTML = `${cartItem.quantity}`;
          }
        }
      }
    });
  });
}

function setupDeliveryOptionsInputListeners() {
  const deliveryOptionInputs = document.querySelectorAll(
    ".js-delivery-option-input"
  );

  deliveryOptionInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const productId = input.dataset.productId;
      const deliveryOptionId = input.dataset.deliveryOptionId;

      updateDeliveryOption(productId, deliveryOptionId);
      updatePaymentSummary();
      updateShippingDate(productId, input.dataset.date);
    });
  });
}

function checkCart() {
  if (cart.length === 0) {
    document.querySelector(".js-order-summary").innerHTML = `
      <div class="order-summary-empty">
        Your cart is empty. Please add products to continue shopping.
      </div>
      <a class="button-primary view-products-link" href="amazon.html">
          View products
      </a>
    `;
    document.querySelector(".js-place-order-button").disabled = true;
  }
}

function initializeCart() {
  updateCheckoutNumber();
  updateCartSummary();
  updatePaymentSummary();
  setupDeleteItemListeners();
  setupUpdateQuantityLinks();
  setupDeliveryOptionsInputListeners();
  checkCart();
}

export {
  updateCartSummary,
  updateCheckoutNumber,
  setupDeleteItemListeners,
  setupUpdateQuantityLinks,
  setupDeliveryOptionsInputListeners,
  checkCart,
  initializeCart,
};
