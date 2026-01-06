'use server'

import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logAdminAccess(
  targetUserId: string,
  action: string,
  details?: object
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    // Log to audit_logs (with admin_ prefix in action)
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `[ADMIN] ${action}`,
      table_name: 'profiles',
      record_id: targetUserId,
      new_data: {
        target_user_id: targetUserId,
        ...details,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Admin access log error:', error)
    return { error: 'Failed to log access' }
  }
}
