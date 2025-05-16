"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Function to ensure the products bucket exists
async function ensureProductsBucketExists() {
  const supabase = createServerSupabaseClient()

  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    const productsBucketExists = buckets?.some((bucket) => bucket.name === "products")

    // If bucket doesn't exist, create it
    if (!productsBucketExists) {
      const { error: createError } = await supabase.storage.createBucket("products", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return { success: false, error: createError.message }
      }

      console.log("Products bucket created successfully")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error ensuring bucket exists:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadProductImage(file: File) {
  try {
    const supabase = createServerSupabaseClient()

    // Ensure the bucket exists before uploading
    const bucketCheck = await ensureProductsBucketExists()
    if (!bucketCheck.success) {
      return { success: false, error: `Failed to ensure bucket exists: ${bucketCheck.error}` }
    }

    // Create a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    // Convert file to array buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("products").upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error("Error in uploadProductImage:", error)
    return { success: false, error: error.message || "Failed to upload image" }
  }
}

export async function deleteProductImage(filePath: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Ensure the bucket exists before deleting
    const bucketCheck = await ensureProductsBucketExists()
    if (!bucketCheck.success) {
      return { success: false, error: `Failed to ensure bucket exists: ${bucketCheck.error}` }
    }

    const { error } = await supabase.storage.from("products").remove([filePath])

    if (error) {
      console.error("Error deleting image:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in deleteProductImage:", error)
    return { success: false, error: error.message || "Failed to delete image" }
  }
}
