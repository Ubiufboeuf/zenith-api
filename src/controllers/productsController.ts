import { createPagination, cursorToB64 } from '@/services/cursorService'
import { getProductById, getProductsService } from '@/services/productsService'
import { failure, success } from '@/utils/response'
import type { Request, Response } from 'express'

type GetProductsRequest = Request<null, null, null, {
  code?: string
  since?: string
  limit?: string
  cursor?: string
}>

export async function getProducts (req: GetProductsRequest, res: Response) {
  const pagination = createPagination(req)
  if (!pagination.success) {
    return failure(res, pagination.error, { status: pagination.status })
  }

  const { code, since } = req.query

  const result = await getProductsService({
    limit: pagination.limit,
    cursor: pagination.cursor,
    code,
    since
  })

  if ('nextCursor' in result) { 
    return success(res, {
      products: result.products,
      nextCursor: result.nextCursor ? cursorToB64(result.nextCursor) : null
    })
  }

  return success(res, { products: result })
}

export async function getProduct (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getProductById(id)
  if (!product) {
    return failure(res, 'No se encontró el producto', { status: 404 })
  }
  
  success(res, { product })
}
