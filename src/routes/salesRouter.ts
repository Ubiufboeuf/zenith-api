import { getSale } from '@/controllers/salesController'
import { Router } from 'express'

export const salesRouter = Router()

salesRouter.get('/:id', getSale)
