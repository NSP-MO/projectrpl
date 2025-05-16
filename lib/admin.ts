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

// Update the updateProduct function to include image fields
export async function updateProduct({
  id,
  name,
  price,
  description,
  category,
  stock,
  image_url,
  image_path,
}: {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  image_url?: string
  image_path?: string
}) {
  try {
    const supabase = createServerSupabaseClient()

    const updateData: any = {
      name,
      price,
      description,
      category,
      stock,
      updated_at: new Date().toISOString(),
    }

    // Only include image fields if they are provided
    if (image_url) updateData.image = image_url
    if (image_path) updateData.image_path = image_path

    const { error } = await supabase.from("products").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating product:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in updateProduct:", error)
    return { success: false, error: error.message || "Failed to update product" }
  }
}

// Update the addProduct function to include image fields
export async function createProduct({
  name,
  price,
  description,
  category,
  stock,
  image_url,
  image_path,
}: {
  name: string
  price: number
  description: string
  category: string
  stock: number
  image_url?: string
  image_path?: string
}) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price,
          description,
          category,
          stock,
          image: image_url,
          image_path,
          is_popular: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error adding product:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in addProduct:", error)
    return { success: false, error: error.message || "Failed to add product" }
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
