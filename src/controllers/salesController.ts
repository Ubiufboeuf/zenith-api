import { HttpError } from '@/errors/HttpError'
import { cursorToB64 } from '@/services/cursorService'
import { getSaleById, getSaleIncludeOptions, getSalesQueryOptions, getSalesService } from '@/services/salesService'
import type { GetSaleRequest, GetSalesRequest } from '@/types/salesTypes'
import { failure, success } from '@/utils/response'
import type { Response } from 'express'

export async function getSales (req: GetSalesRequest, res: Response) {
  let options
  try { 
    options = getSalesQueryOptions(req.query)
  } catch (err) {
    if (err instanceof HttpError) {
      return failure(res, err.message, { status: err.statusCode })
    }

    if (err instanceof Error) {
      return failure(res, err.message, { status: 500 })
    }

    return failure(res, 'Error desconocido', { status: 500 })
  }

  const result = await getSalesService(options)

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

  const include = getSaleIncludeOptions(req.query, false)
  const sale = await getSaleById(id, include)
  if (!sale) {
    return failure(res, 'No se encontró la venta', { status: 404 })
  }
  
  success(res, { sale })
}
