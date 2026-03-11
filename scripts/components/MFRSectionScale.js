window._mfrAlpineRegistered = window._mfrAlpineRegistered || {};

if (!window._mfrAlpineRegistered["MFRSectionScale"]) {
  document.addEventListener("alpine:init", () => {
    Alpine.data("MFRSectionScale", (options = {}) => ({
      $section: null,
      $sectionWrapper: null,
      vars: [

      ],
      init() {
        this.$section = this.$el.closest("section");
        this.$sectionWrapper = this.$el.closest( ".shopify-section" );

        if( !gsap || !ScrollTrigger || !ScrollTrigger.create ) return;
        
        this.initScrollTrigger();
      },
      initScrollTrigger() {
        const initialPaddingLeft = parseFloat(
          getComputedStyle(this.$sectionWrapper).paddingLeft
        );
        const initialPaddingRight = parseFloat(
          getComputedStyle(this.$sectionWrapper).paddingRight
        );
        const initialTopLeftBorderRadius = parseFloat(
          getComputedStyle(this.$section).borderTopLeftRadius
        );
        const initialTopRightBorderRadius = parseFloat(
          getComputedStyle(this.$section).borderTopRightRadius
        );

        ScrollTrigger.create({
          trigger: this.$section,
          start: "top 50%",
          end: "top 25%",
          scrub: true,
          onUpdate: (data) => {
            const progress = Math.min(Math.max(data.progress, 0), 1);
            const paddingLeft = initialPaddingLeft * (1 - progress);
            const paddingRight = initialPaddingRight * (1 - progress);
            const topLeftBorderRadius =
              initialTopLeftBorderRadius * (1 - progress);
            const topRightBorderRadius =
              initialTopRightBorderRadius * (1 - progress);
            this.$sectionWrapper.style.paddingLeft = `${paddingLeft}px`;
            this.$sectionWrapper.style.paddingRight = `${paddingRight}px`;
            this.$section.style.borderTopLeftRadius = `${topLeftBorderRadius}px`;
            this.$section.style.borderTopRightRadius = `${topRightBorderRadius}px`;
          }
        })
      }
    }));
  });

  window._mfrAlpineRegistered["MFRSectionScale"] = true;
}
