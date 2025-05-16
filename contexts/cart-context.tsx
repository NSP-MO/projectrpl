"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export type CartItem = {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "benihku_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Calculate total items and price
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Load cart from localStorage or Supabase on mount
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)

      try {
        // Always try to load from localStorage first as a fallback
        const storedCart = localStorage.getItem(CART_STORAGE_KEY)
        let cartItems: CartItem[] = storedCart ? JSON.parse(storedCart) : []

        if (user) {
          try {
            // If user is logged in, try to load cart from Supabase
            const { data, error } = await supabase.from("cart_items").select("*").eq("user_id", user.id)

            if (!error && data && data.length > 0) {
              // Transform Supabase data to CartItem format
              cartItems = data.map((item) => ({
                id: item.product_id,
                name: item.product_name,
                price: item.price,
                image: item.image_url,
                quantity: item.quantity,
              }))
            }
          } catch (error) {
            console.error("Error loading cart from Supabase:", error)
            // We already have the localStorage fallback loaded
          }
        }

        setItems(cartItems)
      } catch (error) {
        console.error("Error loading cart:", error)
        // If all else fails, start with an empty cart
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to localStorage and Supabase when it changes
  useEffect(() => {
    if (!isLoading) {
      // Always save to localStorage as a fallback
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))

      // If user is logged in, try to sync with Supabase
      if (user) {
        const syncCartWithSupabase = async () => {
          try {
            // First, delete all existing cart items for this user
            await supabase.from("cart_items").delete().eq("user_id", user.id)

            // Then insert the current cart items
            if (items.length > 0) {
              const cartItemsForSupabase = items.map((item) => ({
                user_id: user.id,
                product_id: item.id,
                product_name: item.name,
                price: item.price,
                image_url: item.image,
                quantity: item.quantity,
              }))

              await supabase.from("cart_items").insert(cartItemsForSupabase)
            }
          } catch (error) {
            console.error("Error syncing cart with Supabase:", error)
            // Continue using localStorage as fallback
          }
        }

        syncCartWithSupabase()
      }
    }
  }, [items, isLoading, user])

  // Add item to cart
  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((currentItems) => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex((i) => i.id === item.id)

      if (existingItemIndex > -1) {
        // If item exists, increase quantity
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += 1

        toast({
          title: "Jumlah ditambahkan",
          description: `${item.name} sekarang berjumlah ${updatedItems[existingItemIndex].quantity} di keranjang Anda.`,
        })

        return updatedItems
      } else {
        // If item doesn't exist, add it with quantity 1
        toast({
          title: "Ditambahkan ke keranjang",
          description: `${item.name} telah ditambahkan ke keranjang Anda.`,
        })

        return [...currentItems, { ...item, quantity: 1 }]
      }
    })
  }

  // Remove item from cart
  const removeItem = (id: number) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.id === id)

      if (itemToRemove) {
        toast({
          title: "Dihapus dari keranjang",
          description: `${itemToRemove.name} telah dihapus dari keranjang Anda.`,
        })
      }

      return currentItems.filter((item) => item.id !== id)
    })
  }

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }

    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
    toast({
      title: "Keranjang dikosongkan",
      description: "Semua item telah dihapus dari keranjang Anda.",
    })
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
