"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Update the handleSubmit function to fix the redirect issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Password tidak cocok. Silakan periksa kembali.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting signup with:", email)
      const { success, error } = await signup(name, email, password)

      if (success) {
        console.log("Signup successful, preparing to redirect")
        // Check if we need to redirect to a specific page
        const returnUrl =
          typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("returnUrl") : null
        const redirectTo = returnUrl || "/"
        console.log("Redirecting to:", redirectTo)

        // Use toast to notify user
        toast({
          title: "Signup successful",
          description: "Your account has been created successfully.",
        })

        // Force a hard navigation to avoid Firefox issues
        window.location.href = redirectTo
      } else {
        console.error("Signup failed:", error)
        setError(error || "Email sudah terdaftar. Silakan gunakan email lain.")
      }
    } catch (err) {
      console.error("Exception during signup:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center mb-6">
          <Button variant="ghost" className="p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center">Daftar Akun</CardTitle>
            <CardDescription className="text-center">
              Buat akun baru untuk mengakses semua fitur BenihKu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Daftar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-green-600 hover:underline">
                Masuk
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
