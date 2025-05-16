"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import ProtectedRoute from "@/components/protected-route"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="container py-12">
            <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>
            <p>Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-12">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Kosongkan Keranjang
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keranjang Anda Kosong</h2>
            <p className="text-gray-500 mb-6">Anda belum menambahkan produk apapun ke keranjang.</p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-32 h-32">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={128}
                            height={128}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <Link href={`/product/${item.id}`} className="hover:underline">
                                <h3 className="font-semibold">{item.name}</h3>
                              </Link>
                              <p className="text-sm text-gray-500">Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Kurangi jumlah</span>
                              </Button>
                              <div className="flex h-8 w-10 items-center justify-center border-y">{item.quantity}</div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Tambah jumlah</span>
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Hapus item</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Ringkasan Belanja</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Item ({totalItems})</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pengiriman</span>
                      <span>Gratis</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/checkout")}>
                    Lanjut ke Pembayaran
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
