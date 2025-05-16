"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Loader2, MapPin, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import ProtectedRoute from "@/components/protected-route"
import { createOrder } from "@/app/checkout/actions"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [shippingMethod, setShippingMethod] = useState("regular")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      alert("Keranjang Anda kosong. Silakan tambahkan produk ke keranjang terlebih dahulu.")
      return
    }

    setIsSubmitting(true)

    try {
      // Create order in Supabase
      const orderItems = items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))

      const orderData = {
        user_id: user?.id,
        total_amount: totalPrice,
        shipping_info: shippingInfo,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        items: orderItems,
      }

      const { success, orderId } = await createOrder(orderData)

      if (success) {
        // Clear cart after successful order
        clearCart()

        // Redirect to order confirmation page
        router.push(`/orders/${orderId}`)
      } else {
        alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="container py-12">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            <p>Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="container py-12">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Keranjang Anda Kosong</h2>
            <p className="text-gray-500 mb-6">Anda belum menambahkan produk apapun ke keranjang.</p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Mulai Belanja</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container py-12">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/cart")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Keranjang
        </Button>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Informasi Pengiriman</h2>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" name="name" value={shippingInfo.name} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Kota</Label>
                        <Input id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Provinsi</Label>
                        <Input
                          id="province"
                          name="province"
                          value={shippingInfo.province}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Kode Pos</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan (opsional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={shippingInfo.notes}
                        onChange={handleInputChange}
                        placeholder="Instruksi khusus untuk pengiriman"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Metode Pengiriman</h2>
                  </div>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-3">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="regular" id="shipping-regular" />
                      <Label htmlFor="shipping-regular" className="flex-1 cursor-pointer">
                        <div className="font-medium">Reguler (2-3 hari)</div>
                        <div className="text-sm text-gray-500">Gratis</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="express" id="shipping-express" />
                      <Label htmlFor="shipping-express" className="flex-1 cursor-pointer">
                        <div className="font-medium">Express (1 hari)</div>
                        <div className="text-sm text-gray-500">Rp 20.000</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
                  </div>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="bank_transfer" id="payment-bank" />
                      <Label htmlFor="payment-bank" className="flex-1 cursor-pointer">
                        <div className="font-medium">Transfer Bank</div>
                        <div className="text-sm text-gray-500">BCA, Mandiri, BNI, BRI</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="e_wallet" id="payment-ewallet" />
                      <Label htmlFor="payment-ewallet" className="flex-1 cursor-pointer">
                        <div className="font-medium">E-Wallet</div>
                        <div className="text-sm text-gray-500">GoPay, OVO, DANA, LinkAja</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="cod" id="payment-cod" />
                      <Label htmlFor="payment-cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Bayar di Tempat (COD)</div>
                        <div className="text-sm text-gray-500">Bayar saat barang diterima</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 md:hidden"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Bayar Rp ${totalPrice.toLocaleString("id-ID")}`
                )}
              </Button>
            </form>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between text-sm font-medium">
                          <h4 className="line-clamp-1">{item.name}</h4>
                          <p className="ml-4">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                        </div>
                        <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({totalItems} item)</span>
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
                <Button
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 hidden md:flex"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    `Bayar Rp ${totalPrice.toLocaleString("id-ID")}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
