import { HttpError } from '@/errors/HttpError'
import { cursorToB64 } from '@/services/cursorService'
import { createProductService, getProductById, getProductIncludeOptions, getProductsQueryOptions, getProductsResolvingCodes, getProductsService } from '@/services/productsService'
import type { GetProductRequest, GetProductsRequest } from '@/types/productsTypes'
import { getBody } from '@/utils/request'
import { failure, success } from '@/utils/response'
import { validateProductCreation } from '@/validations/productsValidations'
import type { Request, Response } from 'express'

export async function getProducts (req: GetProductsRequest, res: Response) {
  let options
  try {
    options = getProductsQueryOptions(req.query)
  } catch (err) {
    if (err instanceof HttpError) {
      return failure(res, err.message, { status: err.statusCode })
    }

    return failure(res, 'Error interno del servidor', { status: 500 })
  }

  const result = await getProductsService(options)

  if ('nextCursor' in result) { 
    return success(res, {
      products: result.products,
      nextCursor: result.nextCursor ? cursorToB64(result.nextCursor) : null
    })
  }

  return success(res, { products: result })
}

export async function createProduct (req: Request, res: Response) {
  const body = await getBody(req)

  const json = JSON.parse(String(body))
  const createProductValidation = validateProductCreation(json)

  if (!createProductValidation.success) {
    console.error(createProductValidation.error)
    let error = createProductValidation.userFriendlyError
    if (typeof error !== 'string') {
      error = 'Error desconocido'
    }
    return failure(res, error, { status: createProductValidation.status })
  }

  const product = createProductValidation.data

  const result = await createProductService(product)

  if (!result.success) {
    console.error(result.error)
    return failure(res, result.error, { status: result.status })
  }

  success(res, { product, msg: '¡Producto creado exitosamente!' })
}

export async function getProduct (req: GetProductRequest, res: Response) {
  const { id } = req.params

  const include = getProductIncludeOptions(req.query)

  const product = await getProductById({ id, include })
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
