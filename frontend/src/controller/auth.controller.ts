import { supabase } from '../lib/supabase'

export async function signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/`,
        },
    })

    if (error) {
        console.error('Google login error:', error.message)
    }
}

export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Sign out error:', error.message)
        return
    }

    // Reload so main() re-runs, sees no session, and mounts the landing view.
    window.location.reload()
}
