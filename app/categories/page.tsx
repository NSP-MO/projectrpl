import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample categories
const categories = [
  {
    id: 1,
    name: "Tanaman Hias",
    image: "/placeholder.svg?height=300&width=300",
    count: 24,
  },
  {
    id: 2,
    name: "Tanaman Indoor",
    image: "/placeholder.svg?height=300&width=300",
    count: 18,
  },
  {
    id: 3,
    name: "Tanaman Outdoor",
    image: "/placeholder.svg?height=300&width=300",
    count: 15,
  },
  {
    id: 4,
    name: "Tanaman Gantung",
    image: "/placeholder.svg?height=300&width=300",
    count: 12,
  },
  {
    id: 5,
    name: "Kaktus & Sukulen",
    image: "/placeholder.svg?height=300&width=300",
    count: 20,
  },
  {
    id: 6,
    name: "Tanaman Air",
    image: "/placeholder.svg?height=300&width=300",
    count: 8,
  },
  {
    id: 7,
    name: "Tanaman Buah",
    image: "/placeholder.svg?height=300&width=300",
    count: 10,
  },
  {
    id: 8,
    name: "Tanaman Obat",
    image: "/placeholder.svg?height=300&width=300",
    count: 14,
  },
]

export default function CategoriesPage() {
  return (
    <div className="container py-12">
      <Link href="/" className="inline-flex items-center mb-6">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kategori Tanaman</h1>
        <p className="text-gray-500 dark:text-gray-400">Jelajahi berbagai kategori tanaman yang kami tawarkan</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md dark:border-gray-700">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                width={300}
                height={200}
                className="h-[140px] sm:h-[160px] w-full object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} produk</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
