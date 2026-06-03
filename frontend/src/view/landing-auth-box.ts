import { signInWithGoogle } from '../controller/auth.controller'

export class authBox extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const template = document.querySelector('#auth-box-template')

    if (template && template instanceof HTMLTemplateElement) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/src/styles/styles.css'

      const clone = template.content.cloneNode(true)
      if (this.shadowRoot) {
        this.shadowRoot.appendChild(link)
        this.shadowRoot.appendChild(clone)

        const googleButton = this.shadowRoot.querySelector('.oauthButton')
        googleButton?.addEventListener('click', async (event) => {
          event.preventDefault()
          await signInWithGoogle()
        })
      }
    }
  }

  disconnectedCallback() {}
}

customElements.define('auth-box', authBox)
