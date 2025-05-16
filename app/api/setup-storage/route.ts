import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the products bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const productsBucketExists = buckets?.some((bucket) => bucket.name === "products")

    // Create the bucket if it doesn't exist
    if (!productsBucketExists) {
      const { data, error } = await supabase.storage.createBucket("products", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Products storage bucket created successfully" })
    }

    return NextResponse.json({ success: true, message: "Products storage bucket already exists" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
