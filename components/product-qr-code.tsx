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

  const handleDownloadQR = () => {
    try {
      // Create a direct link to QR code generator service
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`

      // Create a temporary anchor element
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`

      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded",
        description: "QR code has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error with QR code:", error)
      toast({
        title: "Error",
        description: "Couldn't download QR code. Please try again.",
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
