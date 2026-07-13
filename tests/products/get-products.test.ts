import { describe, test, expect } from 'bun:test'
import { getProduct, getProductByCode, getProducts } from '../helpers/products'
import { ProductSchema } from '@/schemas/productsSchemas'

// Habría que cambiar estos por productos creados en las pruebas y luego borrarlos
const testCode = 'HKBO1S-RB-US/G'
const testCode2 = '910-006628'
const testId = '6751707d-6b78-4fc1-90c1-578d194e9531'

describe('GET /products', () => {
  describe('Listar productos (Paginación)', () => {
    test('Obtiene el primer producto de la lista', async () => {
      const { products } = await getProducts()
      const productValidation = ProductSchema.safeParse(products[0])
      expect(productValidation.success).toBe(true)
    })

    test('Respeta el límite de elementos solicitado', async () => {
      const { products } = await getProducts({ limit: 5 })
      expect(products.length).toBeLessThanOrEqual(5)
      
      const allCorrect = products.every((p) => ProductSchema.safeParse(p).success)
      expect(allCorrect).toBe(true)
    })

    test('Paginación avanza correctamente usando el cursor', async () => {
      const { products } = await getProducts({ limit: 2 })
      const { nextCursor } = await getProducts()
      const { products: products2 } = await getProducts({ cursor: nextCursor })

      const p1 = products[1]
      const p2 = products2[0]

      expect(p2).toEqual(p1)
    })
  })

  describe('Buscar por filtros (Código / ID)', () => {
    test('Obtiene un producto único por su código', async () => {
      const productsByCode = await getProductByCode(testCode)
      expect(productsByCode.length).toBe(1)

      const allCorrect = productsByCode.every((p) => ProductSchema.safeParse(p).success)
      expect(allCorrect).toBe(true)
    })

    test('Obtiene múltiples productos que comparten el mismo código', async () => {
      const productsByCode = await getProductByCode(testCode2)
      expect(productsByCode.length).toBeGreaterThan(1)

      const allCorrect = productsByCode.every((p) => ProductSchema.safeParse(p).success)
      expect(allCorrect).toBe(true)
    })

    test('Obtiene un producto específico por su ID', async () => {
      const product = await getProduct(testId)
      const productValidation = ProductSchema.safeParse(product)
      expect(productValidation.success).toBe(true)
    })
  })

  describe('Validación de parámetros (Límites inválidos)', () => {
    test('Maneja límites en cero o negativos', async () => {
      let fail1 = false
      try {
        await getProducts({ limit: 0 })
      } catch {
        fail1 = true
      }

      expect(fail1).toBe(true)
      
      let fail2 = false
      try {
        await getProducts({ limit: -1 })
      } catch {
        fail2 = true
      }

      expect(fail2).toBe(true)
    })
    
    // test('Rechaza caracteres no numéricos', async () => {})
    // test('Rechaza valores decimales, infinitos o NaN', async () => {})
  })
})

// cursores inválidos
