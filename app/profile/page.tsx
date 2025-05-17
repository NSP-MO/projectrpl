"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, User, Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { user, session } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar_url: "",
    avatar_path: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, email, avatar_url, avatar_path")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading profile:", error)
          setError("Failed to load profile data")
        } else if (data) {
          setProfileData({
            name: data.name || "",
            email: data.email || user.email || "",
            avatar_url: data.avatar_url || "",
            avatar_path: data.avatar_path || "",
          })
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profileData.name,
          avatar_url: profileData.avatar_url,
          avatar_path: profileData.avatar_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // Update the user metadata with the new avatar_url
      if (profileData.avatar_url) {
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: profileData.avatar_url },
          })
        } catch (err) {
          console.error("Error updating user metadata:", err)
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err: any) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        throw error
      }

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (err: any) {
      console.error("Error updating password:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Link href="/" className="inline-flex items-center mb-6">
        <Button variant="ghost" className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profil Saya</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-600 text-green-600">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Foto Profil</CardTitle>
                <CardDescription>Unggah foto profil Anda</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ProfileImageUpload
                  currentImage={profileData.avatar_url}
                  onImageUploaded={(url, path) => {
                    setProfileData((prev) => ({
                      ...prev,
                      avatar_url: url,
                      avatar_path: path,
                    }))
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Informasi Profil</TabsTrigger>
                <TabsTrigger value="password">Ubah Password</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Profil</CardTitle>
                    <CardDescription>Perbarui informasi profil Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          <User className="h-4 w-4 inline mr-2" />
                          Nama
                        </Label>
                        <Input id="name" name="name" value={profileData.name} onChange={handleProfileChange} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                        <p className="text-sm text-gray-500">Email tidak dapat diubah</p>
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Perubahan
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Ubah Password</CardTitle>
                    <CardDescription>Perbarui password akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">
                          <Lock className="h-4 w-4 inline mr-2" />
                          Password Baru
                        </Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          <Lock className="h-4 w-4 inline mr-2" />
                          Konfirmasi Password Baru
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Perbarui Password
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
