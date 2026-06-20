import type { Product } from '@/types/productsTypes'
import { api } from '../helpers'
import { isValidProduct } from '@/validations/productsValidations'
import { productSchema } from '@/schemas/productsSchemas'

export async function getProducts ({ limit = 1, cursor = null }: { limit?: number, cursor?: string | null } = {}) {
  const data = await api(`/products?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
  if (!data || typeof data !== 'object' || !('products' in data) || !Array.isArray(data.products)) {
    return {
      products: [],
      nextCursor: null
    }
  }
  
  const products: Product[] = []
  
  for (const product of data.products) {
    const isValid = isValidProduct(product)
    if (!isValid) continue
    products.push(product)
  }

  const nextCursor = ('nextCursor' in data ? data.nextCursor : null) as string

  return {
    products,
    nextCursor
  }
}

export async function getProduct (id: string) {
  const data = await api(`/products/${id}`)
  const productValidation = productSchema.safeParse(data)
  if (productValidation.success) return productValidation.data
}

export async function getProductByCode (code: string) {
  const data = await api(`/products?code=${code}`)
  const productValidation = productSchema.safeParse(data)
  if (productValidation.success) return productValidation.data
}
