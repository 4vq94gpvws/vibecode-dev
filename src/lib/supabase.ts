import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prhglprmdolbjapizmok.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaGdscHJtZG9sYmphcGl6bW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTMxNDAsImV4cCI6MjA4NzI4OTE0MH0.fK7umnSBXwJjOtOkz6D-d8eVfRo9N5j-zlzhVLC5tP0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
