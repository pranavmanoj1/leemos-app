import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project-id.supabase.co',
  'sb_publishable_...'
)

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

      this.shadowRoot?.appendChild(link)
      this.shadowRoot?.appendChild(clone)

      const googleButton = this.shadowRoot?.querySelector('.oauthButton')

      googleButton?.addEventListener('click', async (event) => {
        event.preventDefault()

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error('Google login error:', error.message)
        }
      })
    }
  }

  disconnectedCallback(){
    
  }
}

customElements.define('auth-box', authBox)