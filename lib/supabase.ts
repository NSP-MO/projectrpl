import { createClient } from "@supabase/supabase-js"

// Hardcoded Supabase credentials from your environment variables
// This is not ideal for production, but will help us get past the error
const SUPABASE_URL = "https://wdvkckycfgokzvmrhjyt.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdmtja3ljZmdva3p2bXJoanl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE5MzIsImV4cCI6MjA2MjY2NzkzMn0.OJVw92vuZ79sxUWFovALmk9XNJQsJsEM267QdBZkONI"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdmtja3ljZmdva3p2bXJoanl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTkzMiwiZXhwIjoyMDYyNjY3OTMyfQ.l81rZPNAsHgH3Q51VV5704W0JcNp5RK9W0f-S4MNPuE"

// Create a singleton instance for the client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  // For server-side rendering, return a dummy client to avoid errors
  if (typeof window === "undefined") {
    // We're in a server environment, create a minimal client
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  // Client-side: reuse the instance if it exists
  if (clientInstance) return clientInstance

  // Create and cache the client instance
  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return clientInstance
})()

// Server-side client with service role for admin operations
export const createServerSupabaseClient = () => {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
