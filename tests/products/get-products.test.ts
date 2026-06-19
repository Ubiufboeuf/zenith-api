import { beforeAll, describe, expect, test } from 'bun:test'
import { getProduct, getProducts } from '../helpers/products'

describe('GET /products', () => {
  test('debería conseguir el primer producto', async () => {
    const { products } = await getProducts()
    expect(products.length).toBe(1)
  })

  test('debería conseguir los cinco primeros productos', async () => {
    const { products } = await getProducts({ limit: 5 })
    expect(products?.length).toBe(5)
  })

  test('debería conseguir el segundo producto usando un cursor', async () => {
    const firstProducts = await getProducts()
    const secondProducts = await getProducts({ cursor: firstProducts.nextCursor })
    const { products } = await getProducts({ limit: 2 })

    const secondProd = secondProducts.products[0]

    expect(secondProd).toEqual(products[1])
  })
})

describe('GET /product/:id', () => {
  let id: string
  
  beforeAll(async () => {
    const { products } = await getProducts()

    if (!products.length) {
      throw new Error('No se pudieron conseguir los productos para los test')
    }

    const product = products[0]
    if (!product) {
      throw new Error('No se pudo conseguir un producto para los tests')
    }

    id = product.id
  })

  test('debería conseguir un producto específico', async () => {
    const product = await getProduct(id)
    console.log(product)
  })
})
