import { beforeAll, describe, expect, test } from 'bun:test'
import { getProduct, getProductByCode, getProducts } from '../helpers/products'
import type { Product } from '@/types/productsTypes'

describe('GET /products', () => {
  let p: Product
  
  beforeAll(async () => {
    const { products } = await getProducts()

    if (!products.length) {
      throw new Error('No se pudieron conseguir los productos para los test')
    }

    const product = products[0]
    if (!product) {
      throw new Error('No se pudo conseguir un producto para los tests')
    }

    p = product
  })

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


  test('debería conseguir un producto específico por uno de sus códigos', async () => {
    const code = p?.codes[0]?.code

    expect(code).toBeDefined()
    if (!code) return

    const product = await getProductByCode(code)
    const productCode = product?.codes[0]?.code
    
    expect(productCode).toBeDefined()
    expect(productCode).toBe(code)
  })

  test('todos los códigos de un producto deben coincidir en su id de producto', async () => {
    const code = p?.codes[0]?.code

    expect(code).toBeDefined()
    if (!code) return

    const product = await getProductByCode(code)
    const codes = product?.codes

    expect(codes).toBeArray()
    if (codes?.length === 0) return

    const equalIds = codes?.every((c) => c.product_id === p.id)
    expect(equalIds).toBeTrue()
  })
})

describe('GET /products/:id', () => {
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

  test('debería conseguir un producto específico por su id', async () => {
    const product = await getProduct(id)
    expect(product?.id).toBe(id)
  })
})
