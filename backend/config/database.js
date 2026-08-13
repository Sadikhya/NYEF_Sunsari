import mysql from 'mysql2/promise'

export function createDatabase(config = process.env) {
  return mysql.createPool({
    host: config.DB_HOST || 'localhost',
    port: Number(config.DB_PORT || 3306),
    user: config.DB_USER || 'root',
    password: config.DB_PASSWORD || '',
    database: config.DB_NAME || 'nyef_sunsari',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
  })
}

export async function verifyDatabaseConnection(database, logger = console) {
  await database.execute('SELECT 1 AS connected')
  logger.log('MySQL Connected Successfully')
}
