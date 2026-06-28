import { getErrorsDetails } from '@/errors'

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function api (endpoint: string | URL | Request, options?: RequestInit & { silence?: boolean }) {
  const processedOptions: RequestInit = {
    ...options,
    ...(options?.method === 'GET' ? { body: undefined }: {})
  }

  return fetch(`http://localhost:7103${endpoint}`, processedOptions)
    .then(async (res) => {
      if (!res.ok) {
        const data = await getData(res)
        throw new Error(`Error HTTP ${res.status || 'desconocido o indefinido'}! ${(data as any).message}`)
      }

      return getData(res)
    })
    .catch((e) => handleFetchError(e, options?.silence))
}

async function getData (res: Response) {
  const resClon = res.clone()

  return resClon.json()
    .catch(() => res.text())
}

function handleFetchError (err: any, silence: boolean = false) {
  const error = getErrorsDetails(err)
  if (silence) console.error('Error en petición:', error.message)
  else throw err
}
