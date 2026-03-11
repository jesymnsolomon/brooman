
function initializeGSAPScripts() {
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    ScrollSmoother,
    Flip,
    ScrollToPlugin
  );

  const triggers = {
    start: "top-=100 bottom", //will trigger if the top of the elements hits 75% of the viewport from top
    endTrigger: "html", // uncomment if you want to repeat class toggling
    end: "bottom top", // change to "bottom center" and comment out endTrigger if you want to repeat animation
  };

  let elements;

  // Store the ScrollTrigger instances for the parallax effect
  let parallaxScrollTriggers = [];

  // Function to initialize the parallax effect
  function initParallax() {
    gsap.utils.toArray("[data-image-parallax]").forEach((section) => {
      const imgOrPicture = section.querySelector(
        ":scope > img, :scope > picture, :scope > [data-image-parallax-element]"
      );
      if (!imgOrPicture) return;

      // Get heights
      const sectionHeight = section.offsetHeight;
      const imgHeight = imgOrPicture.offsetHeight;
      const heightDiff = imgHeight - sectionHeight;

      // Determine direction
      const direction =
        section.getAttribute("data-image-parallax") === "reverse"
          ? heightDiff
          : -heightDiff;

      // Create ScrollTrigger animation
      const trigger = gsap.fromTo(
        imgOrPicture,
        { y: direction },
        {
          scrollTrigger: {
            trigger: imgOrPicture,
            scrub: 1,
            start: "top bottom",
            end: "bottom top",
            invalidateOnRefresh: true,
          },
          y: 0,
          ease: "none",
        }
      );

      // Store the ScrollTrigger if needed
      parallaxScrollTriggers.push(trigger.scrollTrigger);
    });
  }

  // Destroy the specific ScrollTrigger for the parallax effect
  function destroyParallaxScrollTrigger() {
    parallaxScrollTriggers.forEach((trigger) => {
      trigger.kill(); // Destroy the specific ScrollTrigger instance
    });
    parallaxScrollTriggers = []; // Clear the array after destroying the triggers
  }

  // Debounced resize handler to limit the number of times the parallax is recalculated
  let parallaxResizeTimeout;
  window.onWidthResize(() => {
    clearTimeout(parallaxResizeTimeout);
    parallaxResizeTimeout = setTimeout(() => {
      destroyParallaxScrollTrigger(); // Destroy the existing parallax ScrollTriggers
      initParallax(); // Reinitialize the parallax effect
    }, 200); // Delay the recalculation to 200ms after the resize ends
  });
  destroyParallaxScrollTrigger(); // Destroy the existing parallax ScrollTriggers
  initParallax(); // Reinitialize the parallax effect

  if (document.querySelectorAll("[data-inview],.data-inview").length) {
    // Elements in view
    ScrollTrigger.batch("[data-inview],.data-inview", {
      ...triggers,
      onEnter: (batch) => {
        batch.forEach((element) => {
          element.classList.add("is-inview");
        });
      },
      onLeaveBack: (batch) => {
        batch.forEach((element) => {
          element.classList.remove("is-inview");
        });
      },
    });
  }

  window.initInview = (elements) => {
    // Normalize input (support for selector string or NodeList/array)
    const targets =
      typeof elements === "string"
        ? document.querySelectorAll(normalizeScopedSelector(elements))
        : elements;

    console.log(targets);
    ScrollTrigger.batch(targets, {
      ...triggers,
      start: "top 90%",
      onEnter: (batch) => {
        batch.forEach((element) => {
          element.classList.add("is-inview");
        });
      },
      onLeaveBack: (batch) => {
        batch.forEach((element) => {
          element.classList.remove("is-inview");
        });
      },
    });
  };

  window.initStaggerInview = (container) => {
    const elSelector = container ?? "[data-stagger-inview]";

    ScrollTrigger.batch(elSelector, {
      ...triggers,
      onEnter: (batch) => {
        batch.forEach((element) => {
          const selector = element.getAttribute("data-stagger-inview");
          const children = Array.from(
            element.querySelectorAll(normalizeScopedSelector(selector))
          );

          // Mark elements completely out of horizontal viewport as "already in view"
          children.forEach((child) => {
            const rect = child.getBoundingClientRect();
            if (rect.left >= window.innerWidth || rect.right <= 0) {
              child.classList.add("is-inview");
            }
          });

          // Filter only visible children for animation
          const visibleChildren = children.filter((child) => {
            const rect = child.getBoundingClientRect();
            return rect.left < window.innerWidth && rect.right > 0;
          });

          if (!visibleChildren.length) return;

          // Animate with stagger
          gsap.to(visibleChildren, {
            stagger: {
              delay: 0,
              each: 0.09,
              onComplete() {
                this.targets()[0].classList.add("is-inview");
              },
            },
            immediateRender: true,
          });
        });
      },
      onLeaveBack: (batch) => {
        batch.forEach((element) => {
          const selector = element.getAttribute("data-stagger-inview");
          const children = element.querySelectorAll(
            normalizeScopedSelector(selector)
          );
          children.forEach((child) => child.classList.remove("is-inview"));
        });
      },
    });
  };

  if (document.querySelectorAll("[data-stagger-inview]").length) {
    initStaggerInview();
  }

  window.initSplitTexts = (elements) => {
    elements.forEach((element, i) => {
        element.classList.add("split-text--rendered");
        const splitTexts = new SplitText(element, {
          type: "words",
          wordsClass: "split-text",
        });

        const chars = gsap.utils.toArray(splitTexts.words);

        // Wrap each word in an inner span
        chars.forEach((e) => {
          const inner = document.createElement("span");
          inner.className = "split-text__inner";
          inner.innerHTML = e.innerHTML;
          e.innerHTML = "";
          e.appendChild(inner);
        });

        const animationType = element.getAttribute("data-split-text");

        if (animationType === "colorAnimation") {
          ScrollTrigger.batch(chars, {
            start: "top 70%",
            end: "bottom 70%",
            onEnter: (batch) => {
              batch.forEach((el) => el.classList.add("is-inview"));
            },
            onLeaveBack: (batch) => {
              batch.forEach((el) => el.classList.remove("is-inview"));
            },
          });
        } else if (animationType === "fadeUp") {
          ScrollTrigger.create({
            trigger: element,
            ...triggers,
            onEnter: () => {
              gsap.to(chars, {
                stagger: {
                  delay: 0,
                  each: 0.05,
                  onComplete() {
                    this.targets()[0].classList.add("is-inview");
                  },
                },
                immediateRender: true,
              });
            },
            onLeaveBack: () => {
              chars.forEach((el) => {
                el.classList.remove("is-inview", "split-text--transition-ended");
              });
            },
          });
        }
      });
  }

  initSplitTexts(document.querySelectorAll("[data-split-text]"));


  document
    .querySelectorAll("[data-accent-graphic-parallax]")
    .forEach((e, i) => {
      // Find the closest .shopify-section ancestor
      const shopifySection = e.closest(".shopify-section");
      const header = document.querySelector("header.header");
      const headerHeight = header ? header.offsetHeight : 0;

      let rafId;

      // Create ScrollTrigger for each element
      ScrollTrigger.create({
        trigger: shopifySection,
        start: () => `top 50%`,
        end: () => `bottom 25%`,
        scrub: true,
        onUpdate: (self) => {
          // Cancel previous animation frame if any
          if (rafId) cancelAnimationFrame(rafId);

          rafId = requestAnimationFrame(() => {
            const progress = self.progress;
            const parallaxMultiplier =
              e.getAttribute("data-accent-graphic-parallax") ?? -100;

            gsap.set(e, {
              yPercent: parallaxMultiplier * progress,
            });
          });
        },
      });
    });

  const parallaxElements = document.querySelectorAll("[data-parallax]");
  if (parallaxElements.length) {
    gsap.utils.toArray(parallaxElements).forEach((elem) => {
      const parallaxAttr = elem.getAttribute("data-parallax");
      const yPercent = parallaxAttr === "" ? 50 : parseFloat(parallaxAttr);

      gsap.to(elem, {
        yPercent: yPercent * -1,
        ease: "none",
        scrollTrigger: {
          trigger: elem.closest("section"),
          start: "top top",
          end: "+=100%",
          scrub: 0.5,
        },
      });
    });

    ScrollTrigger.addEventListener("refreshInit", () => {
      gsap.set("[data-parallax]", { yPercent: 0 });
    });
  }

  ScrollTrigger.refresh();
}

onReady(initializeGSAPScripts);

function stickyElementFunction($el = document) {
  $el
    .querySelectorAll("[data-mfr-sticky-container]")
    .forEach((element, i) => {
      let child = element.querySelector("[data-mfr-sticky]");
      const selector = element.getAttribute("data-mfr-sticky-container");
      const device = element.getAttribute("data-mfr-sticky-device");
      const isMobileViewport = window.innerWidth <= 767;

      // Rule 1: Device is "mobile", but viewport is desktop — return
      if (device === "mobile" && !isMobileViewport) return;

      // Rule 2: Device is "desktop", but viewport is mobile — return
      if (device === "desktop" && isMobileViewport) return;

      if (selector && selector.trim() !== "") {
        child = element.querySelector(selector);
      }

      let stickyTrigger;
      if (child) {
        function initializeSticky() {

          stickyTrigger = ScrollTrigger.create({
            trigger: child,
            start: () => {
              const childHeight = child.offsetHeight;
              return `top+=${childHeight / 2}px center`;
            },
            end: () => {
              const elementHeight = element.offsetHeight;
              const childHeight = child.offsetHeight;
              return `+=${elementHeight - childHeight}px`;
            },
            pin: true,
            pinSpacing: true,
          });
        }

        initializeSticky();
        child.stickyTrigger = stickyTrigger;

        // ResizeObserver to refresh on container resize
        const resizeObserver = new ResizeObserver(() => {
          if (stickyTrigger) {
            stickyTrigger.refresh();
          }
        });

        resizeObserver.observe(element);
      }
    });
}
onReady(stickyElementFunction);

function autoPlayVideoFunction() {
  const autoplayVideos = document.querySelectorAll(
    'video[data-autoplay="true"]'
  );

  if (autoplayVideos.length) {
    ScrollTrigger.batch(autoplayVideos, {
      start: "top bottom",
      end: "bottom top",

      onEnter: (batch) => {
        batch.forEach((video) => {
          if (video.paused) video.play();
        });
      },

      onEnterBack: (batch) => {
        batch.forEach((video) => {
          if (video.paused) video.play();
        });
      },

      onLeave: (batch) => {
        batch.forEach((video) => {
          if (!video.paused) video.pause();
        });
      },

      onLeaveBack: (batch) => {
        batch.forEach((video) => {
          if (!video.paused) video.pause();
        });
      },
    });
  }
}
onReady(autoPlayVideoFunction);