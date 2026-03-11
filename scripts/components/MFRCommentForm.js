window._mfrAlpineRegistered = window._mfrAlpineRegistered || {};

if (!window._mfrAlpineRegistered["MFRCommentForm"]) {
  document.addEventListener("alpine:init", () => {
    Alpine.data("MFRCommentForm", () => ({
      selectors: {
        body: '[name="comment[body]"]',
        stars: '[name="stars"]',
        title: '[name="title"]',
        content: '[name="content"]',
        checkedStars: '[name="stars"]:checked',
        form: 'form'
      },
      
      init() {
        this.$form = this.$el.querySelector(this.selectors.form);
        this.$body = this.$form.querySelector(this.selectors.body);
        this.$stars = this.$form.querySelectorAll(this.selectors.stars);
        this.$title = this.$form.querySelector(this.selectors.title);
        this.$content = this.$form.querySelector(this.selectors.content);

        this.updateBody();

        this.$stars.forEach((radio) => {
          radio.addEventListener("change", this.updateBody.bind(this));
        });
        this.$title.addEventListener("input", this.updateBody.bind(this));
        this.$content.addEventListener("input", this.updateBody.bind(this));
      },

      updateBody() {
        const bodyContent = `${this.$form.querySelector(this.selectors.checkedStars).value}|${this.$title.value}|${this.$content.value}`;
        this.$body.value = bodyContent;
      }
    }));
  });

  window._mfrAlpineRegistered["MFRCommentForm"] = true;
}