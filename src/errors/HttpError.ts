export class HttpError extends Error {
  constructor (
    message: string, 
    public readonly reason: string | null = null,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
