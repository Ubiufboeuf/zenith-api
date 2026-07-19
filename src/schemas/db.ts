import { CURRENCIES } from '@/lib/constants/currencies'
import { PAYMENT_METHODS } from '@/lib/constants/payments'
import { PRODUCT_EVENT_LIST, PRODUCT_VALID_CODES } from '@/lib/constants/products'
import { DEFAULT_IVA_RATE, SALE_DOCUMENT_TYPE, SALE_PAYMENT_STATUS, SALE_STATUS, SALE_TYPE } from '@/lib/constants/sales'
import z from 'zod'

export const ProductsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  title: z.string(),
  subtitle: z.string().default(''),
  provider: z.string().default(''),
  brand: z.string().default(''),
  category: z.string().default(''),
  cost_price: z.int(),
  cost_currency: z.enum(CURRENCIES),
  sale_price: z.int(),
  sale_currency: z.enum(CURRENCIES),
  stock: z.number().default(0)
})

export const ProductCodesRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  product_id: z.uuid({ version: 'v4' }),
  code: z.string(),
  type: z.enum(PRODUCT_VALID_CODES),
  is_main: z.enum(['0', '1'])
})

export const ProductEventsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  product_id: z.uuid({ version: 'v4' }),
  event_type: z.enum(PRODUCT_EVENT_LIST),
  previous_value: z.string(),
  new_value: z.string(),
  created_at: z.iso.datetime()
})

export const SalesRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  created_at: z.iso.datetime(),
  last_modified: z.iso.datetime(),
  total: z.int(),
  total_discount: z.int().default(0),
  general_discount: z.int().default(0),
  currency: z.enum(CURRENCIES),
  status: z.enum(SALE_STATUS),
  payment_status: z.enum(SALE_PAYMENT_STATUS),
  document_type: z.enum(SALE_DOCUMENT_TYPE),
  sale_type: z.enum(SALE_TYPE),
  client_id: z.string().nullable(),
  user_id: z.string().nullable()
})

export const SaleDetailsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  sale_id: z.uuid({ version: 'v4' }),
  product_id: z.uuid({ version: 'v4' }),
  quantity: z.number(),
  unit_price_at_moment: z.int(),
  currency: z.enum(CURRENCIES),
  discount: z.int().default(0),
  iva_rate: z.int().default(DEFAULT_IVA_RATE)
})

export const SalePaymentsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  sale_id: z.uuid({ version: 'v4' }),
  amount_paid: z.int(),
  currency: z.enum(CURRENCIES),
  exchange_rate: z.number().default(1),
  payment_method: z.enum(PAYMENT_METHODS),
  created_at: z.iso.datetime()
})
