import { createClient, type Client } from '@libsql/client'
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from '@/lib/constants'

export let db: Client

export async function connectToDB () {
  if (!TURSO_DATABASE_URL) {
    throw new Error('No se pudo conectar a la base de datos', { cause: 'DB_URL es \'undefined\'' })
  }

  db = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN
  })
}
