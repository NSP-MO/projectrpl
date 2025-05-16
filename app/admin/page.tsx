"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Leaf, Plus, Settings, Package, Users, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-gray-50 border-r">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-xl">BenihKu</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all"
              >
                <Package className="h-4 w-4" />
                Produk
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
              >
                <Users className="h-4 w-4" />
                Pengguna
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
              >
                <Settings className="h-4 w-4" />
                Pengaturan
              </Link>
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-600">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-gray-900 mt-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="md:hidden flex items-center gap-2 font-semibold">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="text-xl">BenihKu</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" className="md:hidden" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Keluar</span>
              </Button>
            </div>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <Link href="/admin/products/add">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
              </Link>
            </div>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">Semua Produk</TabsTrigger>
                <TabsTrigger value="published">Dipublikasikan</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <ProductsTable />
              </TabsContent>
              <TabsContent value="published" className="mt-4">
                <ProductsTable filterStatus="published" />
              </TabsContent>
              <TabsContent value="draft" className="mt-4">
                <ProductsTable filterStatus="draft" />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

interface ProductsTableProps {
  filterStatus?: "published" | "draft"
}

function ProductsTable({ filterStatus }: ProductsTableProps) {
  // Sample product data - in a real app, this would come from a database
  const products = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      price: 250000,
      category: "Tanaman Hias",
      status: "published",
      stock: 15,
    },
    {
      id: 2,
      name: "Fiddle Leaf Fig",
      price: 350000,
      category: "Tanaman Indoor",
      status: "published",
      stock: 8,
    },
    {
      id: 3,
      name: "Snake Plant",
      price: 150000,
      category: "Tanaman Indoor",
      status: "published",
      stock: 22,
    },
    {
      id: 4,
      name: "Peace Lily",
      price: 180000,
      category: "Tanaman Hias",
      status: "draft",
      stock: 0,
    },
    {
      id: 5,
      name: "ZZ Plant",
      price: 200000,
      category: "Tanaman Indoor",
      status: "published",
      stock: 12,
    },
    {
      id: 6,
      name: "Pothos",
      price: 120000,
      category: "Tanaman Gantung",
      status: "published",
      stock: 18,
    },
  ]

  // Filter products based on status if needed
  const filteredProducts = filterStatus ? products.filter((product) => product.status === filterStatus) : products

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Produk</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kategori</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Harga</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stok</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">{product.id}</td>
                <td className="p-4 align-middle font-medium">{product.name}</td>
                <td className="p-4 align-middle">{product.category}</td>
                <td className="p-4 align-middle">Rp {product.price.toLocaleString("id-ID")}</td>
                <td className="p-4 align-middle">{product.stock}</td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status === "published" ? "Dipublikasikan" : "Draft"}
                  </span>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    <Link href={`/admin/products/edit/${product.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
