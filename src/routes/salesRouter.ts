import { createSale, editSale, getSale, getSales } from '@/controllers/salesController'
import { Router } from 'express'

export const salesRouter = Router()

salesRouter.get('/', getSales)
salesRouter.post('/', createSale)

salesRouter.get('/:id', getSale)
salesRouter.patch('/:id', editSale)
