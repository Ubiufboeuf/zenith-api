import { createPagination, cursorToB64 } from '@/services/cursorService'
import { getSalesService } from '@/services/salesService'
import type { GetSalesRequest } from '@/types/salesTypes'
import { failure, success } from '@/utils/response'
import type { Response } from 'express'

export async function getSales (req: GetSalesRequest, res: Response) {
  const pagination = createPagination(req)
  if (!pagination.success) {
    return failure(res, pagination.error, { status: pagination.status })
  }

  const result = await getSalesService({
    limit: pagination.limit,
    cursor: pagination.cursor
  })

  if ('nextCursor' in result) { 
    return success(res, {
      sales: result.sales,
      nextCursor: result.nextCursor ? cursorToB64(result.nextCursor) : null
    })
  }

  return success(res, { sales: result })
}
