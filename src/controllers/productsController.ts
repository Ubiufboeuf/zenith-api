import { getErrorsDetails } from '@/errors'
import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { addProduct, getProductBy, getProductsByCursor } from '@/services/productsService'
import { getBody } from '@/utils/request'
import { response } from '@/utils/response'
import { isValidCreateProductBody } from '@/validations/productsValidations'
import type { Request, Response } from 'express'

type GetProductsQueryParams = { barcode?: string, qrcode?: string, limit?: string, cursor?: string }

export async function getProducts (req: Request<null, null, null, GetProductsQueryParams>, res: Response) {
  const { query } = req

  const barcode = query.barcode
  if (barcode) {
    const product = await getProductBy('barcode', barcode)
    if (!product) {
      return response(res, 'No se encontró el producto', { status: 404 })
    }
    
    return res.json(product)
  }

  const qrcode = query.qrcode
  if (qrcode) {
    const product = await getProductBy('qrcode', qrcode)
    if (!product) {
      return response(res, 'No se encontró el producto', { status: 404 })
    }
    
    return res.json(product)
  }

  const limit = Number(query.limit ?? 1)
  let cursorStr = query.cursor

  if (cursorStr === 'undefined' || cursorStr === 'null') {
    cursorStr = undefined
  }

  const cursor = cursorStr
    ? cursorFromB64(JSON.stringify(cursorStr))
    : createCursor()

  if (!cursor) {
    return res.status(500).end()
  }
  
  const { list: products, nextCursor } = await getProductsByCursor(cursor, limit)
  if (!products?.length) {
    return response(res, 'No se encontraron los productos', { status: 404 })
  }
  
  res.json({
    products,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}

export async function getProduct (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getProductBy('id', id)
  if (!product) {
    return response(res, 'No se encontró el producto', { status: 404 })
  }
  
  res.json(product)
}

export async function createProduct (req: Request, res: Response) {
  const body = await getBody(req)
  if (!body || typeof body !== 'string') {
    return response(res, 'Cuerpo de la petición inválido', { status: 400 })
  }

  const product = JSON.parse(body)
  if (!isValidCreateProductBody(product)) {
    return response(res, 'Datos del producto inválidos', { status: 400 })
  }

  // console.log({ product })

  try {
    await addProduct(product)
  } catch (err) {
    const error = getErrorsDetails(err)
    console.error(error)

    return response(res, 'Hubo un error guardando el producto', { status: 500 })
  }

  return res.send(200).end()
}
