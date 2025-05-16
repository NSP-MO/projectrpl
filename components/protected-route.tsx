"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
      } else if (adminOnly && user.user_metadata?.role !== "admin") {
        // Redirect to home if not admin
        router.push("/")
      }
    }
  }, [user, isLoading, router, adminOnly])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  // Only render children if authenticated and has proper permissions
  if (!user || (adminOnly && user.user_metadata?.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
