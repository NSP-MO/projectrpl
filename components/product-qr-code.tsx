"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface ProductQRCodeProps {
  productId: number
  productName: string
}

export default function ProductQRCode({ productId, productName }: ProductQRCodeProps) {
  const [open, setOpen] = useState(false)

  // Generate the full URL for the product
  const productUrl =
    typeof window !== "undefined" ? `${window.location.origin}/product/${productId}` : `/product/${productId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl)
    toast({
      title: "Link disalin!",
      description: "Link produk telah disalin ke clipboard.",
    })
  }

  // Let's use the simplest possible approach for QR code download
  const handleDownloadQR = async () => {
    try {
      // Generate QR code URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`

      // Fetch the image as a blob
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

      // Create a blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)

      toast({
        title: "Success",
        description: "QR code berhasil diunduh.",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "QR code tidak dapat diunduh.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Bagikan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Produk</DialogTitle>
          <DialogDescription>Scan QR code ini untuk melihat {productName} atau bagikan link produk.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg mb-4">
            <QRCodeSVG
              id="qr-svg"
              value={productUrl}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          </div>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Scan QR code ini dengan kamera ponsel Anda untuk melihat produk ini.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Salin Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
