"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page after OAuth callback
    router.push("/")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Mengalihkan...</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar</p>
      </div>
    </div>
  )
}
