import { registerInTheirOwnWords } from './src/view/landing-view';
import { supabase } from './src/lib/supabase'

let libraryMounted = false

function cloneTemplate(id: string) {
    const template = document.getElementById(id) as HTMLTemplateElement
    document.body.appendChild(template.content.cloneNode(true))
}

function unmountLanding() {
    document.querySelectorAll('in-their-own-words, auth-box').forEach(el => el.remove())
}

async function mountLibrary() {
    if (libraryMounted) return
    libraryMounted = true
    unmountLanding()
    await import('./src/view/books-view')
    cloneTemplate('library-template')
}

async function mountLanding() {
    registerInTheirOwnWords()
    await import('./src/view/landing-auth-box')
    cloneTemplate('landing-template')
}

async function main() {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
        await mountLibrary()
        return
    }

    // No session yet — could be a PKCE redirect still being processed
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            await mountLibrary()
        }
    })

    await mountLanding()
}

main();
