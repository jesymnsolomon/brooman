window.addEventListener("load", () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }
});

// For browser resize horizontally
window.onWidthResize = (func) => {
  let windowWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;
      func();
    }
  });
};

// For browser resize vertically
window.onHeightResize = (func, once) => {
  let windowHeight = window.innerHeight;
  const resizeFunction = () => {
    if (window.innerHeight !== windowHeight) {
      windowHeight = window.innerHeight;
      func();
    }
  };

  if (once) {
    const resizeHandler = () => {
      resizeFunction();
      window.removeEventListener("resize", resizeHandler);
    };
    window.addEventListener("resize", resizeHandler);
  } else {
    window.addEventListener("resize", resizeFunction);
  }
};

window.onViewportChange = function (ifMobile, ifDesktop) {
  const mediaQuery = window.matchMedia("(min-width: 1024px)");
  // Check if it's desktop or mobile
  function handleDeviceChange(e) {
    if (e.matches) {
      // Desktop view
      if (ifDesktop) ifDesktop();
    } else {
      // Mobile view
      if (ifMobile) ifMobile();
    }
  }

  // Add event listener for window resize
  mediaQuery.addEventListener("change", handleDeviceChange);

  // Initial check
  handleDeviceChange(mediaQuery);
};

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t), (t = setTimeout(() => fn.apply(this, args), wait));
  };
}
    
// A global function to track multiple elements when they come into view
function observeInViewBatch(elements, callback) {
  const observerOptions = {
    root: null, // Use the viewport as the root
    threshold: 0.1 // Trigger when 10% of the element is in view
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target); // Call callback for the element in view
        observer.unobserve(entry.target); // Optionally stop observing this element
      }
    });
  }, observerOptions);

  elements.each((i, element) => {
    observer.observe(element); // Add each element to the observer
  });
}

function normalizeScopedSelector(selector) {
  return selector
    .split(",")
    .map((sel) => {
      sel = sel.trim();

      // If it contains '>' but doesn't already include ':scope'
      if (sel.includes(">") && !sel.includes(":scope")) {
        // Inject ':scope' before the first '>' in the selector
        return sel.replace(/^\s*/, ":scope ");
      }

      return sel;
    })
    .join(", ");
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  )
}