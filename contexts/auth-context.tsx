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
        // Check for existing session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else if (session) {
          setSession(session)
          setUser(session.user)
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
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
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
