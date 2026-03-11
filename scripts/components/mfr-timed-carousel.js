if (typeof MFRTimedCarousel === "undefined") {
  class MFRTimedCarousel {
    constructor(i, e, options) {
      this.$index = i;
      this.$element = $(e);

      this.selectors = {
        items: "> *",
        bar: ".flickity-page-dots .dot.is-selected",
        allBars: ".flickity-page-dots .dot",
      };

      this.flickityOptions = options.flickityOptions;
      this.autoplayTiming = options.autoplayTiming;
      this.timingArgs = {
        percentTime: 0,
        isPaused: false,
      };

      this.init();
    }

    init() {
      this.$slider = this.$element;
      this.$item = this.$element.find(this.selectors.items);
      this.$currentSlide = this.$element.find(this.selectors.currentSlide);

      this.initCarousel();
      $(window).on("resize", () => {
        if (this.$element.data("flickity"))
          // this.$element.flickity("destroy");
          this.initCarousel();
      });
    }

    initCarousel() {
      if (this.$item.length <= 1) return;
      this.$slider.flickity({
        ...this.flickityOptions,
        on: {
          change: () => {
            this.resetProgressbar();
            this.updateSlideIndicators();
            this.startProgressbar();
          },
        },
      });

      this.updateSlideIndicators();
      this.startProgressbar();
    }

    updateSlideIndicators() {
      const flkty = this.$slider.data("flickity");
      const currentSlideNumber = flkty.selectedIndex + 1;
      this.$allBars = this.$element.find(this.selectors.allBars);

      this.$currentSlide.text(currentSlideNumber);
    }

    startProgressbar() {
      this.resetProgressbar();
      this.timingArgs.percentTime = 0;
      this.timingArgs.isPaused = false;
      // this.timingArgs.tick = setInterval(this.interval.bind(this), 10);
      this.timingArgs.lastTimestamp = performance.now();
      this.timingArgs.tick = requestAnimationFrame(this.interval.bind(this));
    }

    interval(timestamp) {
      if (!this.timingArgs.isPaused) {
        this.timingArgs.percentTime +=
          (timestamp - this.timingArgs.lastTimestamp) /
          (this.autoplayTiming * 1000); // Convert to seconds
        this.timingArgs.lastTimestamp = timestamp;

        if (this.timingArgs.percentTime >= 1) {
          this.$slider.flickity("next", true);
          this.startProgressbar();
        } else {
          this.$element.find(this.selectors.bar).css({
            "--dynamic-width":
              (this.timingArgs.percentTime * 100).toFixed(2) + "%",
          });
          this.timingArgs.tick = requestAnimationFrame(
            this.interval.bind(this)
          );
        }
      }
    }

    resetProgressbar() {
      this.$allBars.css({
        "--dynamic-width": 0 + "%",
      });
      // clearTimeout(this.timingArgs.tick);
      cancelAnimationFrame(this.timingArgs.tick);
    }
  }

  window.MFRTimedCarousel = MFRTimedCarousel;
}
