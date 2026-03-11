function loadLozadImages() {
  // Lazy load for <img> elements
  const lozadObserver = lozad("img.lozad", {
    rootMargin: "50px 0px",
    threshold: 0.1,
    loaded: function (el) {
      // if(el.closest( ".flickity-enabled") && Flickity && Flickity.data) {
      //   Flickity.data(el.closest(".flickity-enabled")).resize();
      // }
    },
  });

  lozadObserver.observe()

  // Lazy load for <picture> elements
  const loadObserverPicture = lozad("picture.lozad", {
    loaded: (el) => {
      // Update all <source> elements
      const sources = el.querySelectorAll("source")

      sources.forEach((source) => {
        const srcset = source.getAttribute("data-srcset")

        if (srcset) {
          source.setAttribute("srcset", srcset)
        }
      })

      // Update the <img> inside <picture>
      const img = el.querySelector("img")

      if (img) {
        const imgSrc = img.getAttribute("data-src")

        if (imgSrc) {
          img.setAttribute("src", imgSrc)
        }
      }
    }
  })

  loadObserverPicture.observe()
}

window.loadLozadImages = loadLozadImages;
onReady(() => loadLozadImages(), true)
document.addEventListener("shopify:section:load", loadLozadImages)

onReady(() => {
  window.quickLinkListen = () => {
    quicklink.listen({
      // Skip prefetching for the specified URLs
      ignores: [
        uri => (
          !uri.includes("/pages") &&
          !uri.includes("/blogs") &&
          !uri.includes("/products") &&
          !uri.includes("/collections")
        )
      ],
      throttle: 6
    })
  }

  window.quickLinkListen()
})

function loadInitialScripts() {
  var links = document.links

  for (let i = 0, linksLength = links.length; i < linksLength; i++) {
    if (links[i].hostname !== window.location.hostname) {
      links[i].target = "_blank";
      links[i].rel = "noreferrer noopener"
    }
  }

  // for setting cookie
  window.setCookie = function (cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
    let expires = "expires=" + d.toUTCString()
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
  }

  // for getting cookie
  window.getCookie = function (cname) {
    let name = cname + "="
    let ca = document.cookie.split(";")

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]

      while (c.charAt(0) == " ") {
        c = c.substring(1)
      }

      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
      }
    }

    return ""
  }

  // Add .is-mac class to <html> if on a Mac or iOS device
  if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
    document.documentElement.classList.add("is-mac")
  }

  let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = currentScroll - lastScrollTop;
    const scrollingDown = scrollDelta > 0;
    const scrollingUpWithThreshold = lastScrollTop - currentScroll > 20;

    const header = document.querySelector("header.header");
    const isActive = currentScroll >= 120 && scrollingDown && !scrollingUpWithThreshold;

    // Toggle header--sticky
    header.classList.toggle("header--sticky", isActive);

    // Toggle header__wrapper--sticky
    const wrapper = header.querySelector(".header__wrapper");
    if (wrapper) {
      wrapper.classList.toggle("header__wrapper--sticky", isActive);
    }

    // Toggle first <img> inside .header__logo
    const firstImg = header.querySelector(".header__logo img:first-child");
    if (firstImg) {
      firstImg.classList.toggle("is-active", !isActive);
    }

    // Toggle last <img> inside .header__logo
    const lastImg = header.querySelector(".header__logo img:last-child");
    if (lastImg) {
      lastImg.classList.toggle("is-active", isActive);
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  });

  // window.addEventListener("scroll", () => {
  //   const header = document.querySelector("header.header")
  //   const scroll = window.scrollY
  //   const isActive = scroll >= 120

  //   // Toggle header--sticky
  //   header.classList.toggle("header--sticky", isActive)

  //   // Toggle header__wrapper--sticky
  //   const wrapper = header.querySelector(".header__wrapper")
  //   if (wrapper) {
  //     wrapper.classList.toggle("header__wrapper--sticky", isActive)
  //   }

  //   // Toggle first <img> inside .header__logo
  //   const firstImg = header.querySelector(".header__logo img:first-child")
  //   if (firstImg) {
  //     firstImg.classList.toggle("is-active", !isActive)
  //   }

  //   // Toggle last <img> inside .header__logo
  //   const lastImg = header.querySelector(".header__logo img:last-child")
  //   if (lastImg) {
  //     lastImg.classList.toggle("is-active", isActive)
  //   }
  // })
}
onReady(() => loadInitialScripts())

onReady(() => {
  mfrComponents.forEach((e, i) => {
    const { selector, component, options } = e;

    if (typeof window[component] !== "undefined") {
      new window[component](i, selector, options);
    }
  })
})

onReady(() => {
  const wrapper = document.querySelector("[data-mfr-overflow-auto-align-vertical]")
  const contentChildren = wrapper ? Array.from(wrapper.children) : []

  let resizeTimeout

  // Function to check overflow and update alignment
  const handleOverflow = () => {
    if (!wrapper) return;

    const wrapperHeight = wrapper.offsetHeight

    // Calculate total height of all children
    let contentHeight = 0;
    contentChildren.forEach((child) => {
      contentHeight += child.scrollHeight
    })

    // Get computed flex-direction
    const flexDirection = window.getComputedStyle(wrapper).flexDirection

    // Adjust alignment based on overflow and flex-direction
    if (contentHeight > wrapperHeight) {
      if (flexDirection === "column") {
        wrapper.style.justifyContent = "flex-start"
      } else {
        wrapper.style.alignItems = "flex-start"
      }
    } else {
      if (flexDirection === "column") {
        wrapper.style.justifyContent = "center"
      } else {
        wrapper.style.alignItems = "center"
      }
    }
  }

  // Debounced resize event listener
  const debouncedResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      requestAnimationFrame(handleOverflow)
    }, 250)
  }

  // Initialize and update on load and resize
  window.addEventListener("resize", debouncedResize)

  // Run once on initial load
  if (wrapper) {
    handleOverflow()
  }
})

onReady(() => {
  const observer = new MutationObserver(() => {
    const okendoWidget = document.querySelector('[data-oke-container] .oke-reviewsTab') || document.querySelector('.okendo-floating-widget');

    if (okendoWidget && !okendoWidget.querySelector('.okendo-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.innerText = '×';
      closeBtn.className = 'okendo-close-btn';
      closeBtn.setAttribute('aria-label', 'Close Reviews');

      // Append the button to the widget
      okendoWidget.appendChild(closeBtn);

      closeBtn.addEventListener('click', (e) => {
        okendoWidget.style.display = 'none';

        const observer2 = new MutationObserver(() => {
          const okendoModal = document.querySelector('#oke-modalContainer');
          const html = document.querySelector("html.is-oke-modalOpen");

          if(okendoModal && html) {
            okendoModal.remove();
            document.querySelector("html").classList.remove("is-oke-modalOpen")
            document.querySelector("body").classList.remove("is-oke-modalOpen")
            observer2.disconnect();
          }
        });

        observer2.observe(document.body, {
          childList: true,
          subtree: true
        });
      });

        // Stop observing after injecting
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

window.addEventListener("hashchange", () => {
  const $el = document.querySelector(window.location.hash)
  if (!$el) return

  Alpine.store(window.location.hash.replace("#", "")).openPopup()
  Alpine.store(window.location.hash.replace("#", "")).openOffcanvas()
})

document.addEventListener("click", (e) => {
  const anchor = e.target.closest("a[href*='#']")
  if (!anchor) return

  if (!anchor.hash || anchor.hash === "") return

  const $el = document.querySelector(anchor.hash)
  if (!$el) return

  const storeKey = anchor.hash.replace("#", "");
  const store = Alpine.store(storeKey)

  if (store?.openPopup) {
    e.preventDefault()
    store.openPopup()
  }

  if (store?.openOffcanvas) {
    e.preventDefault()
    store.openOffcanvas()
  }
})