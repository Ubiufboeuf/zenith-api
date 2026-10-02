import { HttpError } from '@/errors/HttpError'
import { SalePayloadSchema } from '@/schemas/salesSchemas'
import { cursorToB64 } from '@/services/cursorService'
import { createSaleByPayload, getSaleById, getSaleIncludeOptions, getSalesQueryOptions, getSalesService } from '@/services/salesService'
import type { GetSaleRequest, GetSalesRequest } from '@/types/salesTypes'
import { getBody } from '@/utils/request'
import { failure, success } from '@/utils/response'
import { isValidSalePayload } from '@/validations/saleValidations'
import type { Request, Response } from 'express'

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

export async function createSale (req: Request, res: Response) {
  const body = await getBody(req)

  const json = JSON.parse(String(body))

  if (!isValidSalePayload(json)) {
    return failure(res, 'Payload de la venta inválido', { status: 400 })
  }

  const payload = SalePayloadSchema.safeParse(json).data!
  const result = await createSaleByPayload(payload)

  if (!result.success) {
    return failure(res, result.message)  
  }

  return success(res, result)
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
