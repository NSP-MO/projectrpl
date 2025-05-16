"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Product } from "@/lib/products"

export async function getAdminProducts() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("products").select("*").order("id")

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function updateProduct(id: number, productData: Partial<Product>) {
  const supabase = createServerSupabaseClient()

  try {
    // Update the product
    const { data, error } = await supabase
      .from("products")
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating product:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message }
  }
}

export async function createProduct(productData: Omit<Product, "id">) {
  const supabase = createServerSupabaseClient()

  try {
    // Create the product
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating product:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: number) {
  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return { success: false, error: error.message }
  }
}
