"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Loader2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPopularProducts, type Product } from "@/lib/products"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PlantGrid() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [plants, setPlants] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const products = await getPopularProducts()
        setPlants(products)
      } catch (error: any) {
        console.error("Error loading products:", error)
        setError("Gagal memuat produk. Pastikan database telah disiapkan.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (error || plants.length === 0) {
    return (
      <div className="py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            {error || "Tidak ada produk yang tersedia. Pastikan database telah disiapkan."}
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Untuk menyiapkan database:</h3>
          <ol className="list-decimal pl-5 space-y-4 mb-6">
            <li>
              <p>Kunjungi halaman setup untuk mendapatkan instruksi lengkap</p>
              <Link href="/setup" className="text-green-600 hover:underline">
                Buka halaman setup
              </Link>
            </li>
            <li>
              <p>Buka Supabase Dashboard dan pilih project Anda</p>
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline flex items-center mt-1"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Buka Supabase Dashboard
              </a>
            </li>
            <li>
              <p>Jalankan SQL script yang disediakan di halaman setup</p>
            </li>
            <li>
              <p>Kembali ke aplikasi dan refresh halaman</p>
            </li>
          </ol>

          <div className="flex justify-center">
            <Link href="/setup">
              <Button className="bg-green-600 hover:bg-green-700">Siapkan Database</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
      {plants.map((plant) => (
        <Card key={plant.id} className="overflow-hidden dark:border-gray-700">
          <div className="relative">
            <Link href={`/product/${plant.id}`}>
              <Image
                src={plant.image || "/placeholder.svg"}
                alt={plant.name}
                width={300}
                height={300}
                className="h-[180px] sm:h-[200px] w-full object-cover transition-all hover:scale-105"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              onClick={() => toggleFavorite(plant.id)}
            >
              <Heart className={`h-4 w-4 ${favorites.includes(plant.id) ? "fill-red-500 text-red-500" : ""}`} />
              <span className="sr-only">Add to favorites</span>
            </Button>
            {plant.is_popular && (
              <Badge className="absolute left-2 top-2 bg-green-600 dark:bg-green-700">Populer</Badge>
            )}
          </div>
          <CardContent className="p-4">
            <Link href={`/product/${plant.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-1">{plant.name}</h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plant.category}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 pt-0">
            <p className="font-semibold">Rp {plant.price.toLocaleString("id-ID")}</p>
            <Link href={`/product/${plant.id}`}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                Detail
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
