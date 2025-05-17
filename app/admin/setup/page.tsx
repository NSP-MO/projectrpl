"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import StorageSetup from "@/components/storage-setup"
import ProtectedRoute from "@/components/protected-route"

export default function SetupPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="container py-12">
        <Link href="/admin" className="inline-flex items-center mb-6">
          <Button variant="ghost" className="p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Setup</h1>
        </div>

        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Storage Setup</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Configure storage buckets for image uploads. You need at least one storage bucket to upload product
              images.
            </p>
            <StorageSetup />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
