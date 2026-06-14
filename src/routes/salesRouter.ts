import { createSale, editSale, getSale, getSales } from '@/controllers/salesController'
import { Router } from 'express'

export const salesRouter = Router()

salesRouter.get('/', getSales)
salesRouter.post('/', createSale)
salesRouter.patch('/', editSale)

salesRouter.get('/:id', getSale)
// salesRouter.delete('/:id', deleteSale)
