import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
)

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