export function createMemberRepository(database) {
  const fields = 'id, name, contact, address, business, profile_picture, created_at, updated_at'

  return {
    async listAdmin() {
      const [rows] = await database.execute(`SELECT ${fields} FROM members ORDER BY id DESC`)
      return rows
    },

    async listPublic() {
      const [rows] = await database.execute('SELECT id, name, business, profile_picture FROM members ORDER BY name')
      return rows
    },

    async findById(id) {
      const [rows] = await database.execute(`SELECT ${fields} FROM members WHERE id = ? LIMIT 1`, [id])
      return rows[0] || null
    },

    async create(member) {
      const [result] = await database.execute(
        'INSERT INTO members (name, contact, address, business, profile_picture) VALUES (?, ?, ?, ?, ?)',
        [member.name, member.contact, member.address, member.business, member.profile_picture],
      )
      return this.findById(result.insertId)
    },

    async update(id, member) {
      const [result] = await database.execute(
        'UPDATE members SET name = ?, contact = ?, address = ?, business = ?, profile_picture = ? WHERE id = ?',
        [member.name, member.contact, member.address, member.business, member.profile_picture, id],
      )
      return result.affectedRows ? this.findById(id) : null
    },

    async remove(id) {
      const [result] = await database.execute('DELETE FROM members WHERE id = ?', [id])
      return result.affectedRows > 0
    },
  }
}
