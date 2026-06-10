import { db } from '@/config/db'
import type { Sale } from '@/types/saleTypes'

export async function getSaleById (id: string): Promise<Sale | undefined> {
  const query = 'SELECT * FROM sales WHERE id = ?'
  const result = await db.execute(query, [id])

  if (!result?.rows.length) return
  
  const sale = result.rows[0] as unknown as Sale
  
  // console.log('sale:', sale)

  return sale
}
