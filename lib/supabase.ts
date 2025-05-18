import { createClient } from "@supabase/supabase-js"

// Get Supabase URL and anon key from environment variables if available
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wdvkckycfgokzvmrhjyt.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdmtja3ljZmdva3p2bXJoanl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTE5MzIsImV4cCI6MjA2MjY2NzkzMn0.OJVw92vuZ79sxUWFovALmk9XNJQsJsEM267QdBZkONI"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkdmtja3ljZmdva3p2bXJoanl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA5MTkzMiwiZXhwIjoyMDYyNjY3OTMyfQ.l81rZPNAsHgH3Q51VV5704W0JcNp5RK9W0f-S4MNPuE"

// Create a singleton instance for the client-side
let clientInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  try {
    // For server-side rendering, return a dummy client to avoid errors
    if (typeof window === "undefined") {
      // We're in a server environment, create a minimal client
      console.log("Creating server-side Supabase client")
      return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    }

    // Client-side: reuse the instance if it exists
    if (clientInstance) {
      return clientInstance
    }

    // Create and cache the client instance
    console.log("Creating new client-side Supabase client")
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a minimal client that won't throw errors
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
})()

// Server-side client with service role for admin operations
export const createServerSupabaseClient = () => {
  try {
    console.log("Creating server Supabase client with service role")
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
}
