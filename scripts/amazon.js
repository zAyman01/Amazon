import { cart, addToCart } from "../data/cart.js";
import { products, loadProductsFetch } from "../data/products.js";
import "./utils/search.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadProductsFetch(); // Ensure products are loaded before filtering

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");

  if (searchQuery) {
    filterAndDisplayProducts(searchQuery);
  } else {
    initializeProductsGrid(); // Show all products if no search query
  }
});

function filterAndDisplayProducts(query) {
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query.toLowerCase())
      )
  );

  displayProducts(filteredProducts);
}

function initializeProductsGrid() {
  displayProducts(products);
}

function displayProducts(productList) {
  const productsGrid = document.querySelector(".js-products-grid");
  if (productsGrid) {
    productsGrid.innerHTML = productList.length
      ? productList.map(generateProductHTML).join("")
      : "<p>No products found.</p>";

    document.querySelectorAll(".js-add-to-cart").forEach((button) => {
      button.addEventListener("click", handleAddToCartClick);
    });

    updateCartQuantity();
  }
}

function generateProductHTML(product) {
  return `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}">
      </div>
      <div class="product-name limit-text-to-2-lines">${product.name}</div>
      <div class="product-rating-container">
        <img class="product-rating-stars" src="${product.getStarsURL()}">
        <div class="product-rating-count link-primary">${
          product.rating.count
        }</div>
      </div>
      <div class="product-price">$${product.getPrice()}</div>
      <div class="product-quantity-container">
        <select data-product-id="${product.id}">
          ${Array.from(
            { length: 10 },
            (_, i) => `<option value="${i + 1}">${i + 1}</option>`
          ).join("")}
        </select>
      </div>
      <div class="product-spacer"></div>
      <div class="added-to-cart" id="js-added-to-cart-${product.id}">
        <img src="images/icons/checkmark.png"> Added to cart
      </div>
      <button class="add-to-cart-button js-add-to-cart button-primary" data-product-id="${
        product.id
      }">
        Add to Cart
      </button>
    </div>
  `;
}

export function updateCartQuantity() {
  const cartQuantity = document.querySelector(".js-cart-quantity");
  if (cartQuantity) {
    const totalQuantity = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
    cartQuantity.innerHTML = totalQuantity;
    localStorage.setItem("cartQuantity", totalQuantity);
  }
}

function handleAddToCartClick(event) {
  const button = event.target;
  const productId = button.dataset.productId;

  button.disabled = true;

  addToCart(productId);
  updateCartQuantity();

  const addedEl = document.getElementById(`js-added-to-cart-${productId}`);
  if (addedEl) {
    addedEl.style.opacity = 1;

    setTimeout(() => {
      addedEl.style.opacity = 0;
      button.disabled = false;
    }, 1500);
  }
}
