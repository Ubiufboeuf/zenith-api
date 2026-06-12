import { db } from '@/config/db'
import type { CreateSaleBody, Sale } from '@/types/salesTypes'
import { createCursor } from './cursorService'
import type { Cursor } from '@/types/cursorTypes'

export async function getSalesByCursor (cursor: Cursor | null, limit: number): Promise<{ list: Sale[], nextCursor: Cursor | null }> {
  const lastId = cursor?.lastId ?? null

  const result = await db.execute(
    lastId
      ? 'SELECT * FROM sales WHERE id > ? ORDER BY id ASC LIMIT ?'
      : 'SELECT * FROM sales ORDER BY id ASC LIMIT ?',
    lastId ? [lastId, limit + 1] : [limit + 1]
  )

  const rows = result.rows as unknown as Sale[]

  const hasMore = rows.length > limit
  const list = hasMore ? rows.slice(0, limit) : rows

  return {
    list,
    nextCursor: hasMore
      ? createCursor(list.at(-1)?.id)
      : null
  }
}

export async function getSaleById (id: string): Promise<Sale | undefined> {
  const query = 'SELECT * FROM sales WHERE id = ?'
  const result = await db.execute(query, [id])

  if (!result?.rows.length) return
  
  const sale = result.rows[0] as unknown as Sale
  
  // console.log('sale:', sale)

  return sale
}

export async function addNewSale (saleData: CreateSaleBody) {
  const saleId = crypto.randomUUID()

  const sale: Sale = {
    id: saleId,
    date: saleData.date,
    total: saleData.total,
    total_discount: saleData.total_discount
  }

  const transaction = await db.transaction('write')

  try {
    // Agregar venta (SALES)
    await transaction.execute({
      sql: 'INSERT INTO sales (id, date, total, total_discount) VALUES (?, ?, ?, ?)',
      args: Object.values(sale)
    })

    // Batch de detalles de producto (SALE_DETAILS)
    const detailPromises = saleData.products.map((p) => transaction.execute({
      sql: `
        INSERT INTO sale_details (id, sale_id, product_id, quantity, unit_price_at_moment, discount) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        crypto.randomUUID(),
        saleId,
        p.product_id,
        p.quantity,
        p.unit_price_at_moment,
        p.discount
      ]
    }))

    await Promise.all(detailPromises)

    // Batch de pagos (SALE_PAYMENTS)
    if (saleData.payments && saleData.payments.length > 0) {
      const paymentPromises = saleData.payments.map((p) => transaction.execute({
        sql: `
          INSERT INTO sale_payments (id, sale_id, amount_paid, currency, exchange_rate)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          crypto.randomUUID(),
          saleId,
          p.amount_paid,
          p.currency,
          p.exchange_rate
        ]
      }))

      await Promise.all(paymentPromises)
    }

    // Confirmar la transacción de la bd
    transaction.commit()
    console.log(`Venta ${saleId} procesada con éxito junto con sus detalles y pagos.`)

    return { success: true, saleId }
  } catch (error) {
    // Cancela la transacción en caso de error
    try {
      await transaction.rollback()
    } catch (rollbackError) {
      console.error('Error crítico al hacer ROLLBACK:', rollbackError)
      return { success: false, rollbackError }
    }

    console.error('Error en la transacción de venta. Cambios revertidos.', error)
    return { success: false, err: error }
  }
}
