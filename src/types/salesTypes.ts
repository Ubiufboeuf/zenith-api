import type { createSaleBodySchema } from '@/schemas/salesSchemas'
import type z from 'zod'

export interface Sale {
  id: string
  // state: 'pending' // ej, si no hay pago, queda pendiente, pero la venta se guarda
  date: string
  total: number
  total_discount: number
}

export type CreateSaleBody = z.infer<typeof createSaleBodySchema>
