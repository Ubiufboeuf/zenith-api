import { createClient, type Client } from '@libsql/client'
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL, LOCAL_DATABASE_URL, DB } from '@/lib/constants/env'

export let db: Client

export async function connectToDB () {
  if (DB === 'local') {
    if (!LOCAL_DATABASE_URL) throw new Error('Falta especificar la URL local de la BD')

    db = createClient({ url: LOCAL_DATABASE_URL })

    await checkIfConnectedToDB(db)

    return
  }
  
  if (!TURSO_DATABASE_URL) {
    throw new Error('No se pudo conectar a la base de datos', { cause: 'DB_URL es \'undefined\'' })
  }

  db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN
  })

  await checkIfConnectedToDB(db)
}

async function checkIfConnectedToDB (db: Client) {
  try {
    await db.execute('PRAGMA foreign_keys = ON;')

    if (DB === 'local') {
      // Cambiado a sqlite_master para que sea compatible con el archivo local
      const result = await db.execute(
        'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'products\';'
      )
      
      if (result.rows.length === 0) {
        throw new Error('La base de datos local existe, pero no tiene el esquema cargado. Ejecutá el script de inicialización primero.', {
          cause: 'SCHEMA_NOT_FOUND'
        })
      }
    }
  } catch (error) {
    if (error instanceof Error && error.cause === 'SCHEMA_NOT_FOUND') throw error
    
    throw new Error('No se pudo conectar a la base de datos', { cause: error })
  }
}
