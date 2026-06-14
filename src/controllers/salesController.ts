import { createCursor, cursorFromB64, cursorToB64 } from '@/services/cursorService'
import { addNewSale, modifySale, getSaleById, getSalesByCursor } from '@/services/salesService'
import { getErrorsDetails } from '@/errors'
import { getBody } from '@/utils/request'
import { response } from '@/utils/response'
import { isValidCreateSaleBody, isValidEditSaleBody } from '@/validations/salesValidations'
import type { Request, Response } from 'express'
import { HttpError } from '@/errors/HttpError'

export async function getSales (req: Request, res: Response) {
  const { query } = req
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
  
  const { list: sales, nextCursor } = await getSalesByCursor(cursor, limit)
  if (!sales?.length) {
    return response(res, 'No se encontraron las ventas', { status: 404 })
  }
  
  res.json({
    sales,
    nextCursor: nextCursor ? cursorToB64(nextCursor) : null
  })
}

export async function getSale (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  const product = await getSaleById(id)
  if (!product) {
    return response(res, 'No se encontró la venta', { status: 404 })
  }
  
  res.json(product)
}

export async function createSale (req: Request, res: Response) {
  const body = await getBody(req)
  if (!body || typeof body !== 'string') {
    return response(res, 'Cuerpo de la petición inválido', { status: 400 })
  }

  const sale = JSON.parse(body)
  if (!isValidCreateSaleBody(sale)) {
    return response(res, 'Datos de la venta inválidos', { status: 400 })
  }

  console.log(sale)
  try {
    await addNewSale(sale)
  } catch (err) {
    const error = getErrorsDetails(err)
    console.error(error)

    return response(res, 'Hubo un error guardando la venta', { status: 500 })
  }

  return res.send(200).end()
}

export async function editSale (req: Request<{ id: string }>, res: Response) {
  const { id } = req.params

  if (!id) {
    return response(res, 'Falta especificar el ID de la venta', { status: 400 })
  }
  
  const body = await getBody(req)
  if (!body || typeof body !== 'string') {
    return response(res, 'Cuerpo de la petición inválido', { status: 400 })
  }
  
  const sale = JSON.parse(body)
  if (!isValidEditSaleBody(sale)) {
    const msg = sale.id === ''
      ? 'Falta especificar el ID de la venta'
      : 'Datos de la venta inválidos'
    
    return response(res, msg, { status: 400 })
  }

  // console.log(sale)
  try {
    await modifySale(id, sale)
  } catch (err) {
    const error = getErrorsDetails(err)
    console.error(error)

    if (error instanceof HttpError) {
      return response(res, error.message, { status: error.statusCode })
    }

    return response(res, 'Hubo un error guardando la venta', { status: 500 })
  }

  return response(res, `Venta ${id} editada exitosamente`, { status: 200 })
}
