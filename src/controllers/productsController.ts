import { createPagination, cursorToB64 } from '@/services/cursorService'
import { getProductById, getProductsResolvingCodes, getProductsService } from '@/services/productsService'
import type { GetProductsRequest } from '@/types/productsTypes'
import { getBody } from '@/utils/request'
import { failure, success } from '@/utils/response'
import type { Request, Response } from 'express'

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

export async function resolveCodes (req: Request, res: Response) {
  const body = await getBody(req)
  const codes = JSON.parse(body as string)
  
  if (!Array.isArray(codes) || codes.length === 0) {
    return failure(res, 'Cuerpo de la petición inválido. Se espera una lista de códigos', { status: 400 })
  }
  
  const products = await getProductsResolvingCodes(codes)

  success(res, { products })
}
