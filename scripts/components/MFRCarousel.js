window._mfrAlpineRegistered = window._mfrAlpineRegistered || {};

if (!window._mfrAlpineRegistered["MFRCarousel"]) {
  document.addEventListener("alpine:init", () => {
    Alpine.data("MFRCarousel", (options = {}) => ({
      flkty: null,
      observer: null,
      settings: {
        cellAlign: "left",
        contain: true,
        wrapAround: false,
        selectedAttraction: 0.2,
        friction: 0.8,
        ...options,
      },
      mobileSettings: {
        selectedAttraction: 0.2,
        friction: 0.8,
        ...options.mobileSettings,
      },
      selectors: {
        itemClass: ".mfr-carousel__item",
      },
      resizeDebounceTimeout: null,

      init() {
        this.checkAndToggle();
        this.checkViewportChange();

        this.observer = new ResizeObserver(() => {
          if (this.resizeDebounceTimeout)
            clearTimeout(this.resizeDebounceTimeout);
          this.resizeDebounceTimeout = setTimeout(() => {
            requestAnimationFrame(() => this.checkAndToggle());
          }, 100);
        });

        this.observer.observe(this.$el);
      },

      checkAndToggle() {
        const wrapper = this.$el;
        const wrapperWidth = wrapper.offsetWidth;
        const totalWidth = this.calculateTotalWidth(wrapper, true);

        if (totalWidth > wrapperWidth) {
          if (!this.flkty && !this.$el.classList.contains("flickity-enabled")) {
            this.initFlickity();
          }
          else {
            this.flkty.resize();
          }
        } else {
          this.destroyFlickity();
        }
      },

      // Function to calculate the total width of all carousel cells
      calculateTotalWidth(wrapper, ignoreRight = false) {
        const cells = wrapper.querySelectorAll(this.selectors.itemClass);
        let totalWidth = 0;

        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          const style = getComputedStyle(cell);
          const margin =
            parseFloat(style.marginLeft) + parseFloat(style.marginRight);

          // If it's the last cell and ignoreRight is true
          if (ignoreRight && i === cells.length - 1) {
            const paddingRight = parseFloat(style.paddingRight);
            const paddingLeft = parseFloat(style.paddingLeft);
            const adjustedPadding = paddingLeft - paddingRight;

            totalWidth += cell.offsetWidth + margin + adjustedPadding;
          } else {
            totalWidth += cell.offsetWidth + margin;
          }
        }

        return totalWidth;
      },

      initFlickity() {
        const section = this.$el;
        const flkty = (this.flkty = new Flickity(
          this.$el,
          window.innerWidth <= 1023 && this.mobileSettings
            ? this.mobileSettings
            : this.settings
        ));

        flkty.on("settle", (index) => {
          this.$el.querySelectorAll("video").forEach((video) => {
            video.pause();
          });

          const inactiveCells = flkty.cells.filter((cell, cellIndex, cellArray) => cellIndex != index)
          if (inactiveCells) {
            this.removeFocusOnElements(inactiveCells)
          }

          const currentCell = flkty.cells[index]?.element;
          if (!currentCell) return;

          this.addFocusOnElements(currentCell)

          const video = currentCell.querySelector("video[data-mfr-autoplay]");

          if (video) {
            video.play().catch(() => {
              console.warn("Video couldn't autoplay — user interaction might be required.");
            });
          }
        });

        flkty.on('select', function () {
          const dots = section.querySelectorAll('.flickity-page-dots .dot');

          const selectedIndex = flkty.selectedIndex;

          const selectedDot = dots[selectedIndex];
          const prevDot = dots[selectedIndex - 1];
          const nextDot = dots[selectedIndex + 1];

          dots.forEach(dot => {
            dot.classList.remove('is-prev', 'is-next', 'is-selected');
          });

          if(selectedDot) selectedDot.classList.add("is-selected");
          if (prevDot) prevDot.classList.add('is-prev');
          if (nextDot) nextDot.classList.add('is-next');
        });
      },

      destroyFlickity() {
        if (this.flkty) {
          this.flkty.destroy();
          this.flkty = null;
        }
      },

      destroy() {
        if (this.observer) {
          this.observer.disconnect();
        }
        this.destroyFlickity();
      },

      checkViewportChange() {
        onViewportChange(
          () => {
            this.destroyFlickity();
            this.checkAndToggle();
          },
          () => {
            this.destroyFlickity();
            this.checkAndToggle();
          }
        );
      },

      addFocusOnElements(container) {
        const currentCellFocusableElements = getFocusableElements(container)
        if (currentCellFocusableElements.length > 0) {
          currentCellFocusableElements.forEach(el => {
            el.setAttribute('tabindex', '1')
          })
        }
      },

      removeFocusOnElements(container) {
        container.forEach(item => {
          const inactiveCellsFocusableElements = getFocusableElements(item.element)
          if (inactiveCellsFocusableElements.length > 0) {
            inactiveCellsFocusableElements.forEach(el => {
              el.setAttribute('tabindex', '-1')
            })
          }
        })
      }
    }));
  });

  window._mfrAlpineRegistered["MFRCarousel"] = true;
}
