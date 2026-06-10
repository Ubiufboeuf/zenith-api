import express from 'express'
import { connectToDB } from '@/config/db'
import { getErrorsDetails } from '@/utils/errors'
import { PORT } from '@/lib/constants'
import { ROUTES } from '@/lib/routes'
import { productsRouter } from './routes/productsRouter'
import { salesRouter } from './routes/salesRouter'

async function main () {
  try {
    await connectToDB()
  } catch (err) {
    const error = getErrorsDetails(err)
    console.error(`${error.message} ${error.cause ? `(${error.cause})` : ''}`)
    return
  }

  const app = express()
  app.disable('x-powered-by')

  app.use(ROUTES.PRODUCTS, productsRouter)
  app.use(ROUTES.SALES, salesRouter)

  app.use((req, res) => res.status(404).end())

  app.listen(PORT, () => console.log(`Servidor levantado en el puerto :${PORT}`))
}

await main()
