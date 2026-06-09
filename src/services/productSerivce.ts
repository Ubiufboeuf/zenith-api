import { db } from '@/config/db'
import type { Product } from '@/types/productTypes'
import { isValidProduct } from '@/validations/productValidations'

export async function getProductById (id: string): Promise<Product | undefined> {
  const query = 'SELECT * FROM products WHERE id = ?'
  const result = await db.execute(query, [id])

  if (!result?.rows.length) {
    return
  }
  
  const product = result.rows[0]
  if (!isValidProduct(product)) return
  
  console.log(product)

  return product
}
