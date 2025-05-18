"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user session when app loads
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        console.log("Initializing auth...")
        // Check for existing session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else if (session) {
          console.log("Session found:", session)
          setSession(session)

          // Get the user's profile data
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("avatar_url")
              .eq("id", session.user.id)
              .single()

            // If profile data exists with avatar_url, add it to user metadata
            if (profileData && profileData.avatar_url) {
              const updatedUser = {
                ...session.user,
                user_metadata: {
                  ...session.user.user_metadata,
                  avatar_url: profileData.avatar_url,
                },
              }
              setUser(updatedUser)
            } else {
              setUser(session.user)
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError)
            setUser(session.user)
          }
        } else {
          console.log("No session found")
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "session exists" : "no session")

      if (session) {
        try {
          // Get the user's profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", session.user.id)
            .single()

          // If profile data exists with avatar_url, add it to user metadata
          if (profileData && profileData.avatar_url) {
            const updatedUser = {
              ...session.user,
              user_metadata: {
                ...session.user.user_metadata,
                avatar_url: profileData.avatar_url,
              },
            }
            setUser(updatedUser)
          } else {
            setUser(session?.user || null)
          }

          setSession(session)
        } catch (error) {
          console.error("Error updating user after auth change:", error)
          setUser(session?.user || null)
          setSession(session)
        }
      } else {
        setUser(null)
        setSession(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return { success: false, error: error.message }
      }

      console.log("Login successful:", data)
      return { success: true }
    } catch (error: any) {
      console.error("Unexpected login error:", error)
      return { success: false, error: error.message || "Terjadi kesalahan saat login" }
    }
  }

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      // Register new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "user",
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // If successful, add user profile data
      if (data.user) {
        try {
          // Create profiles table if it doesn't exist
          await supabase.rpc("exec_sql", {
            sql_query: `
              CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY REFERENCES auth.users(id),
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `,
          })

          // Insert profile data
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: data.user.id,
              name,
              email,
              role: "user",
            },
          ])

          if (profileError) {
            console.error("Error creating profile:", profileError)
          }
        } catch (err) {
          console.error("Error setting up profile:", err)
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Terjadi kesalahan saat mendaftar" }
    }
  }

  // Google sign-in function
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Terjadi kesalahan saat login dengan Google" }
    }
  }

  // Add resetPassword function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Terjadi kesalahan saat mengirim email reset password" }
    }
  }

  // Add updateUserPassword function
  const updateUserPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Terjadi kesalahan saat mengubah password" }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        signup,
        logout,
        isLoading,
        signInWithGoogle,
        resetPassword,
        updateUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
