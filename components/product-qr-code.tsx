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
    const canvas = document.getElementById("product-qr-code") as HTMLCanvasElement
    if (!canvas) return

    // Convert the SVG to a canvas element
    const svgElement = document.getElementById("qr-svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas2 = document.createElement("canvas")
    const ctx = canvas2.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas2.width = img.width
      canvas2.height = img.height
      ctx?.drawImage(img, 0, 0)

      // Create download link
      const link = document.createElement("a")
      link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
      link.href = canvas2.toDataURL("image/png")
      link.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
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
