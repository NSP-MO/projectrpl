"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProtectedRoute from "@/components/protected-route"
import { getProductById } from "@/lib/products"
import { updateProduct } from "@/lib/admin"

// Sample plant data - in a real app, this would come from a database
const plantsData = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    price: 250000,
    image: "/placeholder.svg?height=500&width=500",
    category: "Tanaman Hias",
    description:
      "Monstera Deliciosa atau Swiss Cheese Plant adalah tanaman hias populer dengan daun besar berlubang yang unik. Tanaman ini berasal dari hutan hujan tropis Amerika Tengah dan sangat cocok sebagai tanaman indoor.",
    careInstructions: {
      light: "Cahaya tidak langsung yang terang. Hindari sinar matahari langsung yang dapat membakar daun.",
      water: "Siram saat lapisan atas tanah kering (sekitar seminggu sekali). Kurangi penyiraman di musim dingin.",
      soil: "Campuran tanah yang kaya nutrisi dengan drainase yang baik.",
      humidity: "Menyukai kelembaban tinggi. Semprotkan daun secara teratur atau gunakan humidifier.",
      temperature: "Suhu ideal 18-30°C. Hindari suhu di bawah 15°C.",
      fertilizer: "Pupuk setiap bulan selama musim pertumbuhan (musim semi dan musim panas).",
    },
    seller: {
      name: "Toko Tanaman Sejahtera",
      rating: 4.8,
      responseTime: "± 1 jam",
    },
    isPopular: true,
    status: "published",
    stock: 15,
  },
  // ... other plants data
]

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const productId = Number.parseInt(params.id)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Product form state
  const [product, setProduct] = useState({
    id: 0,
    name: "",
    price: 0,
    image: "",
    category: "",
    description: "",
    status: "published",
    stock: 0,
    isPopular: false,
    careInstructions: {
      light: "",
      water: "",
      soil: "",
      humidity: "",
      temperature: "",
      fertilizer: "",
    },
  })

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      try {
        const productData = await getProductById(productId)

        if (productData) {
          setProduct({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            category: productData.category,
            description: productData.description,
            status: "published", // Default value
            stock: 0, // Default value
            isPopular: productData.is_popular,
            careInstructions: {
              light: productData.care_instructions?.light || "",
              water: productData.care_instructions?.water || "",
              soil: productData.care_instructions?.soil || "",
              humidity: productData.care_instructions?.humidity || "",
              temperature: productData.care_instructions?.temperature || "",
              fertilizer: productData.care_instructions?.fertilizer || "",
            },
          })
        } else {
          setError("Produk tidak ditemukan")
        }
      } catch (error) {
        console.error("Error loading product:", error)
        setError("Terjadi kesalahan saat memuat data produk")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCareInstructionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct((prev) => ({
      ...prev,
      careInstructions: {
        ...prev.careInstructions,
        [name]: value,
      },
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setProduct((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      // Prepare the product data for update
      const productData = {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        is_popular: product.isPopular,
        care_instructions: product.careInstructions,
      }

      const { success, error } = await updateProduct(productId, productData)

      if (success) {
        setSuccess("Produk berhasil disimpan!")

        // Optionally redirect back to admin page after a delay
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      } else {
        setError(error || "Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container py-12">
        <Link href="/admin" className="inline-flex items-center mb-6">
          <Button variant="ghost" className="p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Produk</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Batal
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-600 text-green-600">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="care">Perawatan</TabsTrigger>
              <TabsTrigger value="images">Gambar</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Informasi dasar tentang produk yang akan ditampilkan kepada pelanggan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Produk</Label>
                      <Input
                        id="name"
                        name="name"
                        value={product.name}
                        onChange={handleInputChange}
                        className="dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga (Rp)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={product.price}
                        onChange={handleInputChange}
                        className="dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select value={product.category} onValueChange={(value) => handleSelectChange("category", value)}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="Tanaman Hias">Tanaman Hias</SelectItem>
                          <SelectItem value="Tanaman Indoor">Tanaman Indoor</SelectItem>
                          <SelectItem value="Tanaman Outdoor">Tanaman Outdoor</SelectItem>
                          <SelectItem value="Tanaman Gantung">Tanaman Gantung</SelectItem>
                          <SelectItem value="Kaktus & Sukulen">Kaktus & Sukulen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stok</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={product.stock}
                        onChange={handleInputChange}
                        className="dark:bg-gray-800 dark:border-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={product.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="published">Dipublikasikan</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 h-full pt-8">
                      <input
                        type="checkbox"
                        id="isPopular"
                        name="isPopular"
                        checked={product.isPopular}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                      />
                      <Label htmlFor="isPopular">Tandai sebagai produk populer</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={product.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="dark:bg-gray-800 dark:border-gray-700"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="care">
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Informasi Perawatan</CardTitle>
                  <CardDescription>
                    Informasi tentang cara merawat tanaman yang akan ditampilkan kepada pelanggan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="light">Cahaya</Label>
                      <Textarea
                        id="light"
                        name="light"
                        value={product.careInstructions.light}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="water">Penyiraman</Label>
                      <Textarea
                        id="water"
                        name="water"
                        value={product.careInstructions.water}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="soil">Media Tanam</Label>
                      <Textarea
                        id="soil"
                        name="soil"
                        value={product.careInstructions.soil}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="humidity">Kelembaban</Label>
                      <Textarea
                        id="humidity"
                        name="humidity"
                        value={product.careInstructions.humidity}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Suhu</Label>
                      <Textarea
                        id="temperature"
                        name="temperature"
                        value={product.careInstructions.temperature}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fertilizer">Pemupukan</Label>
                      <Textarea
                        id="fertilizer"
                        name="fertilizer"
                        value={product.careInstructions.fertilizer}
                        onChange={handleCareInstructionsChange}
                        rows={3}
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Gambar Produk</CardTitle>
                  <CardDescription>Unggah gambar produk yang akan ditampilkan kepada pelanggan.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <div className="mx-auto w-32 h-32 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.id ? (
                          <img
                            src={product.image || `/placeholder.svg?height=300&width=300`}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Belum ada gambar</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline">Unggah Gambar</Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Format yang didukung: JPG, PNG. Ukuran maksimal: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  )
}
