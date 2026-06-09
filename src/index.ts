import express from 'express'
import { connectToDB } from '@/config/db'
import { getErrorsDetails } from '@/utils/errors'
import { PORT } from '@/lib/constants'
import { productRouter } from '@/routes/productRouter'
import { ROUTES } from '@/lib/routes'

async function main () {
  try {
    await connectToDB()
  } catch (err) {
    const error = getErrorsDetails(err)
    console.error(`${error.message} ${error.cause ? `(${error.cause})` : ''}`)
    return
  }

  const app = express()

  app.get('/', (_, res) => res.status(404).end())
  app.use(ROUTES.PRODUCT, productRouter)

  app.listen(PORT, () => console.log(`Servidor levantado en el puerto :${PORT}`))
}

await main()
