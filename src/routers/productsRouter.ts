import { getProduct, getProducts, resolveCodes } from '@/controllers/productsController'
import { Router } from 'express'

export const productsRouter = Router()

productsRouter.get('/', getProducts)
productsRouter.get('/:id', getProduct)
productsRouter.post('/resolve-codes', resolveCodes)
