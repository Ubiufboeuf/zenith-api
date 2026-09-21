export const {
  TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN,
  LOCAL_DATABASE_URL,
  DB = 'prod',
  PORT = 8080
} = process.env

export const envOrigins = (process.env.ENV_ORIGINS ?? '').split(' ')
