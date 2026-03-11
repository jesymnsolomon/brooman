class DetailsModal extends HTMLElement {
  constructor() {
    super()
    this.detailsContainer = this.querySelector("details")
    this.summaryToggle = this.querySelector("summary")
    this.trapFocusHandlers = {}

    if (this.detailsContainer) {
      this.detailsContainer.addEventListener("keyup", (event) => event.code.toUpperCase() === "ESCAPE" && this.close())
    }

    if (this.summaryToggle) {
      this.summaryToggle.addEventListener("click", this.onSummaryClick.bind(this))
      this.summaryToggle.setAttribute("role", "button")
    }

    if (this.querySelector('button[type="button"]')) {
      this.querySelector('button[type="button"]').addEventListener("click", this.close.bind(this))
    }
  }

  isOpen() {
    return this.detailsContainer.hasAttribute("open")
  }

  onSummaryClick(event) {
    event.preventDefault()
    event.target.closest("details").hasAttribute("open") ? this.close() : this.open(event)
  }

  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.classList.contains("modal-overlay")) {
      this.close(false)
    }
  }

  open(event) {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this)

    event.target.closest("details").setAttribute("open", true)
    document.body.addEventListener("click", this.onBodyClickEvent)
    document.body.classList.add("overflow-hidden")

    this.trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    )
  }

  close(focusToggle = true) {
    this.removeTrapFocus(focusToggle ? this.summaryToggle : null)
    this.detailsContainer.removeAttribute("open")
    document.body.removeEventListener("click", this.onBodyClickEvent)
    document.body.classList.remove("overflow-hidden")
  }

  getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
      )
    )
  }

  trapFocus(container, elementToFocus = container) {
    let elements = this.getFocusableElements(container)
    let first = elements[0]
    let last = elements[elements.length - 1]

    this.removeTrapFocus()

    this.trapFocusHandlers.focusin = (event) => {
      if (event.target !== container && event.target !== last && event.target !== first) {
        return
      }

      document.addEventListener('keydown', this.trapFocusHandlers.keydown)
    }

    this.trapFocusHandlers.focusout = () => {
      document.removeEventListener('keydown', this.trapFocusHandlers.keydown)
    }

    this.trapFocusHandlers.keydown = (event) => {
      if (event.code.toUpperCase() !== 'TAB') return

      if (event.target === last && !event.shiftKey) {
        event.preventDefault()
        first.focus()
      }

      if ((event.target === container || event.target === first) && event.shiftKey) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('focusout', this.trapFocusHandlers.focusout)
    document.addEventListener('focusin', this.trapFocusHandlers.focusin)

    if (elementToFocus) {
      elementToFocus.focus()
    }
  }

  removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', this.trapFocusHandlers.focusin)
    document.removeEventListener('focusout', this.trapFocusHandlers.focusout)
    document.removeEventListener('keydown', this.trapFocusHandlers.keydown)

    if (elementToFocus) {
      elementToFocus.focus()
    }
  }
}

customElements.define("details-modal", DetailsModal)