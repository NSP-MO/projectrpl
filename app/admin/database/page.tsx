"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProtectedRoute from "@/components/protected-route"
import { supabase } from "@/lib/supabase"

export default function DatabaseManagementPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const addMoreProducts = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Get the SQL script content
      const response = await fetch("/api/get-sql-script?file=add-more-products.sql")

      if (!response.ok) {
        throw new Error("Failed to fetch SQL script")
      }

      const sqlScript = await response.text()

      // Execute the SQL script
      const { error } = await supabase.rpc("exec_sql", { sql_query: sqlScript })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Successfully added more products to the database!",
      })
    } catch (error: any) {
      console.error("Error adding products:", error)
      setResult({
        success: false,
        message: `Error: ${error.message || "Failed to add products"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container py-12">
        <Link href="/admin" className="inline-flex items-center mb-6">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Manajemen Database</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola database produk dan kategori</p>
        </div>

        {result && (
          <Alert className={`mb-6 ${result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
            <AlertTitle>{result.success ? "Berhasil!" : "Gagal!"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Produk</CardTitle>
              <CardDescription>Tambahkan lebih banyak produk ke database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aksi ini akan menambahkan 24 produk baru ke dalam database, mencakup semua kategori tanaman.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-600 hover:bg-green-700" onClick={addMoreProducts} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Tambah Produk
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
