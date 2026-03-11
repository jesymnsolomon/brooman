document.addEventListener("alpine:init", () => {
  Alpine.store("offCanvas", {
    mobileMenu: false,
    cart: false,
    contact: false,
  });
});
