import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const DEMO_COMPANY_ID = '11111111-1111-1111-1111-111111111111'
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
