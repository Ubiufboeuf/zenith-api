import type { createProductBodySchema, createProductSchema, createSaleProductSchema, productSchema } from '@/schemas/productsSchemas'
import type z from 'zod'
import type { Currency } from './currenciesTypes'

export type Product = z.infer<typeof productSchema>
export type CreateProduct = z.infer<typeof createProductSchema>
export type CreateProductBody = z.infer<typeof createProductBodySchema>
export type CreateSaleProduct = z.infer<typeof createSaleProductSchema>

export interface ProductRow {
  '0': string
  '1': string
  '2': string
  '3': string
  '4': number
  '5': Currency
  '6': number
  '7': Currency
  '8': number
  length: number
  id: string
  barcode: string
  qrcode: string
  description: string
  cost_price: number
  cost_currency: Currency
  sale_price: number
  sale_currency: Currency
  stock: number
}
