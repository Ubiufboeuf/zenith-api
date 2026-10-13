import { CURRENCIES } from '@/lib/constants/currenciesConstants'
import { PAYMENT_METHODS } from '@/lib/constants/paymentsConstants'
import { PRODUCT_EVENT_LIST, PRODUCT_VALID_CODES } from '@/lib/constants/productsConstants'
import { DEFAULT_IVA_RATE, SALE_DOCUMENT_TYPE, SALE_PAYMENT_STATUS, SALE_STATUS, SALE_TYPE } from '@/lib/constants/salesConstants'
import z from 'zod'

export const ProductsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  title: z.string(),
  subtitle: z.string().default(''),
  provider: z.string().default(''),
  brand: z.string().default(''),
  category: z.string().default(''),
  costPrice: z.int(),
  costCurrency: z.enum(CURRENCIES),
  salePrice: z.int(),
  saleCurrency: z.enum(CURRENCIES),
  stock: z.number().default(0)
})

export const ProductCodesRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  productId: z.uuid({ version: 'v4' }),
  code: z.string(),
  type: z.enum(PRODUCT_VALID_CODES),
  isMain: z.enum(['0', '1'])
})

export const ProductEventsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  productId: z.uuid({ version: 'v4' }),
  eventType: z.enum(PRODUCT_EVENT_LIST),
  previousValue: z.string(),
  newValue: z.string(),
  createdAt: z.iso.datetime()
})

export const SalesRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  createdAt: z.iso.datetime(),
  lastModified: z.iso.datetime(),
  total: z.int(),
  totalDiscount: z.int().default(0),
  generalDiscount: z.int().default(0),
  currency: z.enum(CURRENCIES),
  status: z.enum(SALE_STATUS),
  paymentStatus: z.enum(SALE_PAYMENT_STATUS),
  documentType: z.enum(SALE_DOCUMENT_TYPE),
  saleType: z.enum(SALE_TYPE),
  documentSerie: z.string(),
  documentNumber: z.string(),
  clientId: z.string().nullable(),
  userId: z.string().nullable()
})

export const SaleDetailsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  saleId: z.uuid({ version: 'v4' }),
  productId: z.uuid({ version: 'v4' }),
  quantity: z.number(),
  unitPriceAtMoment: z.int(),
  currency: z.enum(CURRENCIES),
  discount: z.int().default(0),
  ivaRate: z.int().default(DEFAULT_IVA_RATE),
  snapshot: z.string().default('{}')
})

export const SalePaymentsRowSchema = z.object({
  id: z.uuid({ version: 'v4' }).default(() => crypto.randomUUID()),
  saleId: z.uuid({ version: 'v4' }),
  amountPaid: z.int(),
  currency: z.enum(CURRENCIES),
  exchangeRate: z.number().default(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  createdAt: z.iso.datetime()
})
