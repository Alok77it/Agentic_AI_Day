import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  kv_store_b5bcac8d: {
    Row: {
      key: string
      value: any
      created_at: string
      updated_at: string
    }
    Insert: {
      key: string
      value: any
      created_at?: string
      updated_at?: string
    }
    Update: {
      key?: string
      value?: any
      created_at?: string
      updated_at?: string
    }
  }
}
