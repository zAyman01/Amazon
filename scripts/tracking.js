import { getProduct, loadProductsFetch } from "../data/products.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import "./utils/search.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadProductsFetch();

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order-id");
  const productId = urlParams.get("product-id");

  if (!orderId || !productId) {
    document.querySelector(".main").innerHTML =
      "<h2>Invalid order request.</h2>";
    return;
  }

  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    document.querySelector(".main").innerHTML = "<h2>Order not found.</h2>";
    return;
  }

  let product = order.products.find((p) => p.productId === productId);
  if (!product) {
    document.querySelector(".main").innerHTML =
      "<h2>Product not found in this order.</h2>";
    return;
  }

  let Item = getProduct(productId);
  if (!Item) {
    document.querySelector(".main").innerHTML =
      "<h2>Error: Product details not available.</h2>";
    return;
  }

  const orderDate = dayjs(order.orderTime);
  const estimatedDeliveryDate = dayjs(product.estimatedDeliveryTime);
  const shippingDate = orderDate.add(24, "hours");
  const today = dayjs();

  let statusIndex = 0; 
  if (today.isAfter(shippingDate)) statusIndex = 1; // Shipped
  if (today.isAfter(estimatedDeliveryDate)) statusIndex = 2; // Delivered

  // Generate HTML dynamically
  document.querySelector(".main").innerHTML = `
    <div class="order-tracking">
      <a class="back-to-orders-link link-primary" href="orders.html">
        View all orders
      </a>

      <div class="delivery-date">Arriving on ${estimatedDeliveryDate.format(
        "dddd, MMMM D"
      )}</div>

      <div class="product-info">Product Name: ${Item.name}</div>
      <div class="product-info">Quantity: ${product.quantity}</div>
      <img class="product-image" src="${Item.image}" alt="${Item.name}">

      <div class="progress-labels-container">
        <div class="progress-label">Preparing</div>
        <div class="progress-label">Shipped</div>
        <div class="progress-label">Delivered</div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar"></div>
      </div>
    </div>
  `;

  // Update progress bar
  const progressLabels = document.querySelectorAll(".progress-label");
  const progressBar = document.querySelector(".progress-bar");

  function updateTrackingStatus(index) {
    progressLabels.forEach((label, i) => {
      label.classList.toggle("current-status", i === index);
    });
    progressBar.style.width = `${(index / (progressLabels.length - 1)) * 100}%`;
  }

  updateTrackingStatus(statusIndex);
});
