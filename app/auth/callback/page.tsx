"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          router.push("/auth/login?error=Authentication%20failed")
          return
        }

        if (data?.session) {
          // Redirect to home page or a specific page after successful login
          const returnUrl = localStorage.getItem("returnUrl") || "/"
          localStorage.removeItem("returnUrl") // Clean up
          router.push(returnUrl)
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error during auth callback:", error)
        router.push("/auth/login?error=Authentication%20failed")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-sm text-muted-foreground">Mengautentikasi...</p>
      </div>
    </div>
  )
}
