import { createPagination, cursorToB64 } from '@/services/cursorService'
import { getSaleById, getSalesService } from '@/services/salesService'
import type { GetSaleRequest, GetSalesRequest } from '@/types/salesTypes'
import { failure, success } from '@/utils/response'
import type { Response } from 'express'

export async function getSales (req: GetSalesRequest, res: Response) {
  const pagination = createPagination(req)
  if (!pagination.success) {
    return failure(res, pagination.error, { status: pagination.status })
  }

  const { include, since, until, currency } = req.query

  const result = await getSalesService({
    limit: pagination.limit,
    cursor: pagination.cursor,
    include,
    since,
    until,
    currency
  })

  if ('nextCursor' in result) { 
    return success(res, {
      sales: result.sales,
      nextCursor: result.nextCursor ? cursorToB64(result.nextCursor) : null
    })
  }

  return success(res, { sales: result })
}

export async function getSale (req: GetSaleRequest, res: Response) {
  const { id } = req.params
  const { include } = req.query

  const sale = await getSaleById(id, include)
  if (!sale) {
    return failure(res, 'No se encontró la venta', { status: 404 })
  }
  
  success(res, { sale })
}
