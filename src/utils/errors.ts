export function getErrorsDetails (err: unknown): Error {
  if (err instanceof Error) return err
  if (typeof err === 'string') return Error(err)
  return Error(`Error desconocido: ${err}`)
}
