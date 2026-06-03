import { signInWithGoogle } from '../controller/auth.controller'
// Resolve the stylesheet through Vite so it points at the hashed asset in prod
// (a hard-coded '/src/styles/styles.css' only exists under the dev server).
import styleUrl from '../styles/styles.css?url'

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
      link.href = styleUrl

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
