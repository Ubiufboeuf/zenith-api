import { createProduct, getProduct, getProducts, resolveCodes } from '@/controllers/productsController'
import { Router } from 'express'

export const productsRouter = Router()

productsRouter.get('/', getProducts)
productsRouter.post('/', createProduct)
productsRouter.get('/:id', getProduct)
productsRouter.post('/resolve-codes', resolveCodes)
