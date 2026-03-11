function init() {
  const links = document.querySelectorAll("a[href='#']");
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });
}

onReady(init);