class Cart {
  #localStorageKey;
  cartItems = JSON.parse(localStorage.getItem(this.#localStorageKey)) || [
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

  constructor(localStorageKey) {
    this.#localStorageKey = localStorageKey;
  }

  saveToStorage() {
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.cartItems));
  }

  addToCart(productId) {
    const quantitySelect = document.querySelector(
      `select[data-product-id="${productId}"]`
    );
    const selectedQuantity = parseInt(quantitySelect.value, 10);

    let matchingItem;

    this.cartItems.forEach((cartItem) => {
      if (productId === cartItem.productId) {
        matchingItem = cartItem;
        return;
      }
    });

    if (matchingItem) {
      matchingItem.quantity += selectedQuantity;
    } else {
      this.cartItems.push({
        productId: productId,
        quantity: selectedQuantity,
        deliveryOptionId: "1",
      });
    }

    this.saveToStorage();
  }

  deleteCartItem(productId) {
    this.cartItems.forEach((item, index) => {
      if (productId === item.productId) {
        this.cartItems.splice(index, 1);
        return;
      }
    });

    this.saveToStorage();
  }

  updateDeliveryOption(productId, deliveryOptionId) {
    const cartItem = cart.find((item) => item.productId === productId);

    cartItem.deliveryOptionId = deliveryOptionId;

    this.saveToStorage();
  }

  updateCartItemQuantity(productId, newQuantity) {
    const cartItem = this.cartItems.find(
      (item) => item.productId === productId
    );
    if (cartItem) {
      cartItem.quantity = newQuantity;
    }
  }
}



const cart = new Cart("cart-oop");
const businessCart = new Cart("cart-business");

