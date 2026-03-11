document.addEventListener("alpine:init", () => {
  Alpine.store("methods", {
    isMobile: document.documentElement.clientWidth <= 1024,

    init() {
      window.addEventListener("resize", () => this.isMobileDevice());
    },

    isMobileDevice() {
      this.isMobile = document.documentElement.clientWidth <= 1024;
    },
  });
});