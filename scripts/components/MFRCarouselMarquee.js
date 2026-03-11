window._mfrAlpineRegistered = window._mfrAlpineRegistered || {};

if (!window._mfrAlpineRegistered["MFRCarouselMarquee"]) {
  document.addEventListener("alpine:init", () => {
    Alpine.data("MFRCarouselMarquee", (options = {}) => ({
      settings: {
        scrollSpeed: 1,
        ...options,
      },
      vars: {
        requestId: null,
        $carousel: null,
        pauseOnDrag: null,
        toLeft: options["direction"] == "left",
        resizeBound: false,
      },
      init() {
        this.vars.pauseOnDrag = this.settings["pauseOnDrag"];
        this.vars.scrollSpeed = this.settings["scrollSpeed"];

        this.initRender();
      },

      initRender() {
        this.checkViewport();
        let resizeTimer;
        window.onWidthResize(
          () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              this.checkViewport();
            }, 200);
          },
          {
            passive: true,
          }
        );

        this.pauseOnWindowResize();
      },

      checkViewport() {
        const items = this.getCarouselItems();
        const totalItemsWidth = this.getTotalItemsWidth(items);
        const getCarouselWidth = this.$el.offsetWidth;

        const mode = this.settings["renderAutoScrollOn"];
        const windowWidth = window.innerWidth;

        if (mode === "mobile" && windowWidth >= 1024) {
          if (this.$el.classList.contains("flickity-enabled")) {
            this.destroy();
          }
          this.$el
            .querySelectorAll(".appended-item")
            .forEach((el) => el.remove());
          return;
        }

        if (mode === "desktop" && windowWidth <= 1023) {
          if (this.$el.classList.contains("flickity-enabled")) {
            this.destroy();
          }
          this.$el
            .querySelectorAll(".appended-item")
            .forEach((el) => el.remove());
          return;
        }

        if (totalItemsWidth >= getCarouselWidth) {
          this.initCarousel();
        } else {
          if (this.$el.classList.contains("flickity-enabled")) {
            this.destroy();
          }
          this.reappendCarouselItems();
          requestAnimationFrame(() => this.checkViewport());
        }
      },

      initCarousel() {
        if (this.$el.classList.contains("flickity-enabled")) return;
        this.vars.$carousel = new Flickity(this.$el, {
          accessibility: true,
          resize: true,
          wrapAround: true,
          prevNextButtons: false,
          pageDots: false,
          percentPosition: true,
          groupCells: false,
          cellAlign: "center",
          imagesLoaded: true,
          on: {
            ready: () => {
              this.refreshOnImageLoad();
            },
          },
        });

        this.vars.$carousel.x = 0;
        this.play();

        if (this.vars.pauseOnDrag) {
          this.$el.addEventListener("pointerdown", () => {
            this.pause();
          });
          this.$el.addEventListener("mouseleave", () => {
            if (!this.$el.classList.contains("paused")) return;
            this.$el.classList.remove("paused");
            if (!this.vars.requestId) {
              this.play();
            }
          });
        }
      },

      play() {
        if (this.vars.requestId) return;

        const step = () => {
          this.vars.$carousel.x -=
            this.vars.scrollSpeed * (this.vars.toLeft ? 1 : -1);
          this.vars.$carousel.settle(this.vars.$carousel.x);
          this.vars.requestId = window.requestAnimationFrame(step);
        };

        this.vars.requestId = window.requestAnimationFrame(step);
      },

      pause() {
        this.$el.classList.add("paused");
        if (this.vars.requestId) {
          window.cancelAnimationFrame(this.vars.requestId);
          this.vars.requestId = null;
        }
      },

      getCarouselItems() {
        if (this.$el.classList.contains("flickity-enabled")) {
          return this.$el.querySelector(".flickity-slider")?.children || [];
        } else {
          return this.$el.children;
        }
      },

      getTotalItemsWidth(items) {
        let totalWidth = 0;
        const itemArray = Array.from(items);

        itemArray.forEach((el, i) => {
          if (i === itemArray.length - 1) return;
          const style = getComputedStyle(el);
          const margin =
            parseFloat(style.marginLeft) + parseFloat(style.marginRight);
          totalWidth += el.offsetWidth + margin;
        });

        return totalWidth;
      },

      reappendCarouselItems() {
        const children = Array.from(this.$el.children);
        children.forEach((el) => {
          const clone = el.cloneNode(true);
          clone.classList.add("appended-item");
          this.$el.appendChild(clone);
        });
        if (typeof lozad === "function") {
          lozad("img.lozad").observe();
        }
      },

      refreshOnImageLoad() {
        this.$el.querySelectorAll("img").forEach((img) => {
          img.addEventListener("load", () => this._repositionCarousel());
          img.addEventListener("error", () => this._repositionCarousel());
        });
      },

      _repositionCarousel() {
        if (typeof Flickity !== "undefined") {
          const flickityInstance = Flickity.data(this.$el);
          if (flickityInstance) {
            flickityInstance.reposition();
          }
        }
      },

      destroy() {
        this.vars.$carousel.destroy();
        this.pause();
      },

      setSpeed(newSpeed) {
        this.vars.scrollSpeed = newSpeed;
      },

      pauseOnWindowResize() {
        if (this.vars.resizeBound) return;
        this.vars.resizeBound = true;

        let resizeTimeout;
        let isResizing = false;

        const onResizeStart = () => this.pause();
        const onResizeEnd = () => this.play();

        this.vars._resizeHandler = () => {
          if (!isResizing) {
            isResizing = true;
            onResizeStart();
          }

          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            isResizing = false;
            onResizeEnd();
          }, 250);
        };

        window.addEventListener("resize", this.vars._resizeHandler);
      },
    }));
  });

  window._mfrAlpineRegistered["MFRCarouselMarquee"] = true;
}
