import express from 'express'
import { connectToDB } from '@/config/db'
import { getErrorsDetails } from '@/utils/errors'
import { PORT } from '@/lib/constants'
import { productRouter } from '@/routes/productRouter'
import { ROUTES } from '@/lib/routes'
import { productsRouter } from './routes/productsRouter'

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

  app.use(ROUTES.PRODUCT, productRouter)
  app.use(ROUTES.PRODUCTS, productsRouter)

  app.use((req, res) => res.status(404).end())

  app.listen(PORT, () => console.log(`Servidor levantado en el puerto :${PORT}`))
}

await main()
