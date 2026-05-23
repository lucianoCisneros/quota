import type { SupabaseClient } from '@supabase/supabase-js'

export async function assertGroupOwner(
    supabase: SupabaseClient,
    userId: string,
    groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    const { data: group, error } = await supabase
        .from('groups')
        .select('id')
        .eq('id', groupId)
        .eq('creator_id', userId)
        .maybeSingle()

    if (error) return { ok: false, error: error.message }
    if (!group) return { ok: false, error: 'No tenés permiso para este grupo.' }

    return { ok: true }
}
