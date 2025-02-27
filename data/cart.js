import { getProduct } from "./products.js";

export const cart = JSON.parse(localStorage.getItem("cart")) || [
  {
    productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    quantity: 2,
    deliveryOptionId: "1",
  },
  {
    productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    quantity: 1,
    deliveryOptionId: "2",
  },
];

export function saveToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function updateCartItemQuantity(productId, newQuantity) {
  const cartItem = cart.find((item) => item.productId === productId);
  if (cartItem) {
    cartItem.quantity = newQuantity;
    saveToStorage();
  }
}

export function addToCart(productId, quantity = 1) {
  const product = getProduct(productId);
  if (!product) {
    console.error("❌ Product not found!");
    return;
  }

  const quantitySelect = document.querySelector(
    `select[data-product-id="${productId}"]`
  );
  const selectedQuantity = quantitySelect
    ? parseInt(quantitySelect.value, 10)
    : quantity;

  const matchingItem = cart.find((item) => productId === item.productId);

  if (matchingItem) {
    matchingItem.quantity += selectedQuantity;
  } else {
    cart.push({
      productId: productId,
      quantity: selectedQuantity,
      deliveryOptionId: "1",
    });
  }

  saveToStorage();
}

export function clearCart() {
  cart.length = 0;
  saveToStorage();
}

export function deleteCartItem(productId) {
  const itemIndex = cart.findIndex((item) => productId === item.productId);

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    saveToStorage();
  }
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const cartItem = cart.find((item) => item.productId === productId);

  if (cartItem) {
    cartItem.deliveryOptionId = deliveryOptionId;
    saveToStorage();
  }
}
