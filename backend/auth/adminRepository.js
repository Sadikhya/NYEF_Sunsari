export function createAdminRepository(database) {
  return {
    async findByEmail(email) {
      const [rows] = await database.execute('SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1', [email])
      return rows[0] || null
    },

    async createSession(adminId, tokenHash, expiresAt) {
      await database.execute('INSERT INTO admin_sessions (admin_id, token_hash, expires_at) VALUES (?, ?, ?)', [adminId, tokenHash, expiresAt])
    },

    async findValidSession(tokenHash) {
      const [rows] = await database.execute(
        `SELECT admins.id, admins.email
         FROM admin_sessions
         INNER JOIN admins ON admins.id = admin_sessions.admin_id
         WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > NOW()
         LIMIT 1`,
        [tokenHash],
      )
      return rows[0] || null
    },

    async deleteSession(tokenHash) {
      await database.execute('DELETE FROM admin_sessions WHERE token_hash = ?', [tokenHash])
    },
  }
}
