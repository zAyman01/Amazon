import { formatMoney } from "../scripts/utils/money.js";

export let products = [];

export function getProduct(productId) {
  if (!products.length) {
    console.warn("getProduct called before products were loaded.");
    return undefined;
  }
  return products.find((item) => productId === item.id);
}

class Product {
  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating || { stars: 0 };
    this.priceCents = productDetails.priceCents;
    this.keywords = productDetails.keywords;
  }

  getStarsURL() {
    return `images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  getPrice() {
    return formatMoney(this.priceCents);
  }
}

export async function loadProductsFetch() {
  try {
    const response = await fetch("https://supersimplebackend.dev/products");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const productsData = await response.json();
    products = productsData.map(
      (productDetails) => new Product(productDetails)
    );
    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    throw error;
  }
}

