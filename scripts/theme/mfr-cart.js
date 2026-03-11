document.addEventListener("alpine:init", () => {
  Alpine.store("cart", {
    cartData: {},
    cartCounter: 0,
    cartState: {
      updating: false,
    },
    cartCurrency: {
      iso_code: window.currencyVariables.iso_code,
      name: window.currencyVariables.name,
      symbol: window.currencyVariables.symbol,
      money_format: `${window.currencyVariables.symbol}{{amount}}`,
    },
    cartExclusions: [],

    init() {
      this.getCartData();
    },

    async getCartData() {
      try {
        this.cartState.updating = true;

        const { data } = await axios.get("/cart.js", {
          headers: { Accept: "application/json" },
        });

        this.cartData = data;
        this.cartState.updating = false;
        this.cartCounterExclusion();

        const customCartEvent = new CustomEvent("cartReady", {
          detail: { cartData: this.cartData },
        });
        document.dispatchEvent(customCartEvent);
      } catch (error) {
        console.error("Failed to fetch cart data:", error);
        return null;
      }
    },

    async addToCart(
      id,
      quantity = 1,
      properties = {},
      sellingPlanId = null,
      onAdded = null
    ) {
      try {
        const payload = { id, quantity, properties };
        this.cartState.updating = true;

        if (sellingPlanId) {
          payload.selling_plan = sellingPlanId;
        }

        const { data } = await axios.post("/cart/add.js", payload, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        this.getCartData();

        if (typeof onAdded === "function") {
          onAdded(data);
        }
      } catch (error) {
        console.error("Shopify error:", error.response.data);
      }
    },

    async addMultipleToCart(items, onAdded = null) {
      try {
        const addedItems = [];
        this.cartState.updating = true;

        for (const { id, quantity = 1, properties = {} } of items) {
          const { data } = await axios.post(
            "/cart/add.js",
            { id, quantity, properties },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          addedItems.push(data);
        }

        this.getCartData();

        if (typeof onAdded === "function") {
          onAdded(addedItems);
        }

        // return addedItems
      } catch (error) {
        console.error("Shopify error:", error.response.data);
      }
    },

    async removeToCart(key, onRemoved = null) {
      this.cartState.updating = true;

      try {
        const { data } = await axios.post(
          "/cart/change.js",
          { id: key, quantity: 0 },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        this.getCartData();

        if (typeof onRemoved === "function") {
          onRemoved(data);
        }
      } catch (error) {
        console.error("Failed to remove item:", error.response);
      }
    },

    async updateLineItemQuantity(key, quantity, onQuantityUpdate = null) {
      this.cartState.updating = true;
      try {
        const { data } = await axios.post(
          "/cart/change.js",
          { id: key, quantity: quantity },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        this.getCartData();

        if (typeof onQuantityUpdate === "function") {
          onQuantityUpdate(data);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error.response.data);
      }
    },

    async updateItemToSellingPlan(id) {
      // Update item into selling plan/subscription type
    },

    async clearCart() {
      this.cartState.updating = true;

      try {
        const { data } = await axios.post("/cart/clear.js", null, {
          headers: { Accept: "application/json" },
        });

        this.getCartData();
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    },

    cartCounterExclusion() {
      if (this.cartExclusions.length <= 0) return;

      const exclusionLength = this.cartData.items.filter((item) =>
        this.cartExclusions.includes(item.product_type)
      );
      const finalItemsCount = this.cartData.item_count - exclusionLength.length;

      finalItemsCount < 0
        ? (this.cartCounter = 0)
        : (this.cartCounter = finalItemsCount);
    },

    formatMoney(price) {
      return window.Shopify.formatMoney(price, this.cartCurrency.money_format);
    },

    formatSellingplan(plan) {
      if (plan) {
        return `Delivery every ${plan}` || "";
      }

      return plan;
    },

    incrementQuantity(key, quantity) {
      this.updateLineItemQuantity(key, quantity + 1);
    },

    decrementQuantity(key, quantity) {
      const newQuantity = Math.max(0, quantity - 1);
      this.updateLineItemQuantity(key, newQuantity);
    },

    checkIsCartEmpty() {
      return (
        Array.isArray(this.cartData.items) &&
        !Boolean(this.cartData.items.length)
      );
    },

    checkIsCartNotEmpty() {
      return !(
        Array.isArray(this.cartData.items) &&
        !Boolean(this.cartData.items.length)
      );
    },
  });
});
