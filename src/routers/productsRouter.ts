import { createProduct, getProduct, getProductCodes, getProducts, resolveCodes } from '@/controllers/productsController'
import { Router } from 'express'

export const productsRouter = Router()

productsRouter.get('/', getProducts)
productsRouter.post('/', createProduct)
productsRouter.get('/:id', getProduct)
productsRouter.get('/:id/codes', getProductCodes)
productsRouter.post('/resolve-codes', resolveCodes)
