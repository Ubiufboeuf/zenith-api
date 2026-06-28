import type { Product } from '@/types/productsTypes'
import { api } from '.'
import { isValidProduct } from '@/validations/productsValidations'
import { isValidProductsData } from './validations'

export async function getProducts ({ limit = 1, cursor = null }: { limit?: number | string, cursor?: string | null } = {}) {
  const data = await api(`/products?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`)
  if (!isValidProductsData(data)) {
    throw new Error('Datos recibidos inválidos')
  }

  if (!data.success) {
    console.log(data)
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
  if (!data || typeof data !== 'object' || !('product' in data)) {
    throw new Error('Los datos recibidos buscando por id no son los esperados')
  }
  return data.product
}

export async function getProductByCode (code: string) {
  const data = await api(`/products?code=${code}`)
  if (!data || typeof data !== 'object' || !('products' in data) || !Array.isArray(data.products)) {
    throw new Error('Los datos recibidos buscando por código no son una lista')
  }
  return data.products
}
