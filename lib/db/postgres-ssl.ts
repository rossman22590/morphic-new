import type postgres from 'postgres'

type PostgresSslConfig = postgres.Options<
  Record<string, postgres.PostgresType>
>['ssl']

function getSslMode(connectionString: string): string | null {
  try {
    return new URL(connectionString).searchParams.get('sslmode')
  } catch {
    return null
  }
}

export function getPostgresSslConfig(
  connectionString: string
): PostgresSslConfig {
  if (process.env.DATABASE_SSL_DISABLED === 'true') {
    return false
  }

  const sslMode = getSslMode(connectionString)

  switch (sslMode) {
    case 'disable':
      return false
    case 'allow':
    case 'prefer':
    case 'require':
    case 'verify-full':
      return sslMode
    case 'verify-ca':
      return 'require'
    default:
      return process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
  }
}
