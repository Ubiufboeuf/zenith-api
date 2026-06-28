/* eslint-disable @typescript-eslint/no-explicit-any */

type ProductsData = {
  success: true
  products: any[]
  nextCursor: string | null
} | {
  success: false,
  status: number,
  message: string
}

export function isValidProductsData (data: unknown): data is ProductsData {
  if (!data || !(typeof data === 'object')) return false
  if (!('success' in data) || typeof data.success !== 'boolean') return false


  if (data.success === true) {
    if (!('products' in data) || !('nextCursor' in data)) return false
    if (!Array.isArray(data.products) || (data.nextCursor !== null && typeof data.nextCursor !== 'string')) return false
  }
  
  if (data.success === false) {
    if (!('status' in data) || !('message' in data)) return false
    if (typeof data.status !== 'number' || typeof data.message !== 'string') return false
  }

  return true
}
