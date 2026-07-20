import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[UrsaDeFi] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Cloud sync will be unavailable.'
  )
}

export const supabaseBrowser = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

/** Quick health check — returns true if Supabase is reachable */
export async function checkSupabaseHealth(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) return false
  try {
    const { error } = await supabaseBrowser.from('profiles').select('wallet_address').limit(1)
    // Table missing or RLS is still "healthy enough" for connectivity
    if (error && (error.message?.includes('Failed to fetch') || error.message?.includes('ENOTFOUND'))) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export interface ProfileRow {
  wallet_address: string
  public_key?: string | null
  username?: string | null
  company_name?: string | null
  website?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  city_state_zip?: string | null
  country?: string | null
  ein?: string | null
  tagline?: string | null
  logo_data_url?: string | null
  updated_at?: string
  created_at?: string
}

/**
 * Upsert a profile row for a wallet.
 * Creates the account on first connect; refreshes last_seen on return visits.
 * Non-blocking — failures are logged, never throw to the UI.
 */
export async function upsertProfile(
  walletAddress: string,
  publicKey?: string
): Promise<{ ok: boolean; profile?: ProfileRow; error?: string }> {
  if (!walletAddress) return { ok: false, error: 'No wallet address' }
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, error: 'Supabase env not configured' }
  }

  try {
    const payload: Partial<ProfileRow> = {
      wallet_address: walletAddress,
      public_key: publicKey || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseBrowser
      .from('profiles')
      .upsert(payload, { onConflict: 'wallet_address' })
      .select()
      .single()

    if (error) {
      console.warn('[UrsaDeFi] Profile upsert failed:', error.message)
      return { ok: false, error: error.message }
    }

    return { ok: true, profile: data as ProfileRow }
  } catch (err: any) {
    console.warn('[UrsaDeFi] Profile upsert exception:', err?.message || err)
    return { ok: false, error: err?.message || 'Unknown error' }
  }
}

/** Load profile for a wallet from Supabase */
export async function loadProfile(
  walletAddress: string
): Promise<ProfileRow | null> {
  if (!walletAddress || !supabaseUrl || !supabaseAnonKey) return null
  try {
    const { data, error } = await supabaseBrowser
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle()

    if (error || !data) return null
    return data as ProfileRow
  } catch {
    return null
  }
}
