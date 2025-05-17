"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Function to get available buckets and use the first one or create a new one
async function getOrCreateBucket() {
  const supabase = createServerSupabaseClient()

  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { success: false, error: listError.message }
    }

    // If there are existing buckets, use the first one
    if (buckets && buckets.length > 0) {
      return { success: true, bucketName: buckets[0].name }
    }

    // If no buckets exist, try to create one
    const { data, error: createError } = await supabase.storage.createBucket("media", {
      public: true,
    })

    if (createError) {
      console.error("Error creating bucket:", createError)
      return { success: false, error: createError.message }
    }

    return { success: true, bucketName: "media" }
  } catch (error: any) {
    console.error("Error in getOrCreateBucket:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadProductImage(file: File) {
  try {
    const supabase = createServerSupabaseClient()

    // Get an available bucket
    const bucketResult = await getOrCreateBucket()
    if (!bucketResult.success) {
      return { success: false, error: `Failed to get storage bucket: ${bucketResult.error}` }
    }

    const bucketName = bucketResult.bucketName

    // Create a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    // Convert file to array buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage using the available bucket
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
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
    } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      bucket: bucketName,
    }
  } catch (error: any) {
    console.error("Error in uploadProductImage:", error)
    return { success: false, error: error.message || "Failed to upload image" }
  }
}

export async function deleteProductImage(filePath: string, bucketName?: string) {
  try {
    const supabase = createServerSupabaseClient()

    // If no bucket name is provided, try to get an available one
    if (!bucketName) {
      const bucketResult = await getOrCreateBucket()
      if (!bucketResult.success) {
        return { success: false, error: `Failed to get storage bucket: ${bucketResult.error}` }
      }
      bucketName = bucketResult.bucketName
    }

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

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

export async function uploadProfileImage(file: File, userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Get an available bucket
    const bucketResult = await getOrCreateBucket()
    if (!bucketResult.success) {
      return { success: false, error: `Failed to get storage bucket: ${bucketResult.error}` }
    }

    const bucketName = bucketResult.bucketName

    // Create a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert file to array buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage using the available bucket
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
      contentType: file.type,
      upsert: true, // Overwrite existing file
    })

    if (error) {
      console.error("Error uploading profile image:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      bucket: bucketName,
    }
  } catch (error: any) {
    console.error("Error in uploadProfileImage:", error)
    return { success: false, error: error.message || "Failed to upload profile image" }
  }
}
