"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"

type OrderItem = {
  product_id: number
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

type ShippingInfo = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes?: string
}

type OrderData = {
  user_id: string
  total_amount: number
  shipping_info: ShippingInfo
  payment_method: string
  shipping_method: string
  items: OrderItem[]
}

export async function createOrder(orderData: OrderData) {
  try {
    const supabase = createServerSupabaseClient()

    // Insert order into orders table
    const { data: orderInsert, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        shipping_info: orderData.shipping_info,
        payment_method: orderData.payment_method,
        shipping_method: orderData.shipping_method,
        status: "pending", // Initial status
      })
      .select()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { success: false }
    }

    const orderId = orderInsert[0].id

    // Insert order items
    const orderItems = orderData.items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return { success: false }
    }

    // Clear cart items for this user
    await supabase.from("cart_items").delete().eq("user_id", orderData.user_id)

    // Revalidate orders page
    revalidatePath("/orders")

    return { success: true, orderId }
  } catch (error) {
    console.error("Error in createOrder:", error)
    return { success: false }
  }
}
