const columns = [
  'id',
  'name',
  'contact',
  'address',
  'business',
  'social_media',
  'profile_picture',
  'created_at',
  'updated_at',
].join(', ')

export function createMemberRepository(database) {
  async function findById(id) {
    const [rows] = await database.execute(
      `SELECT ${columns} FROM members WHERE id = ?`,
      [id],
    )
    return rows[0] ?? null
  }

  return {
    async list() {
      const [rows] = await database.execute(
        `SELECT ${columns} FROM members ORDER BY created_at DESC, id DESC`,
      )
      return rows
    },

    findById,

    async create(member) {
      const values = Object.values(member)
      const [result] = await database.execute(
        'INSERT INTO members (name, contact, address, business, social_media, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
        values,
      )
      return findById(result.insertId)
    },

    async update(id, member) {
      const [result] = await database.execute(
        'UPDATE members SET name = ?, contact = ?, address = ?, business = ?, social_media = ?, profile_picture = ? WHERE id = ?',
        [...Object.values(member), id],
      )
      return result.affectedRows ? findById(id) : null
    },

    async remove(id) {
      const [result] = await database.execute('DELETE FROM members WHERE id = ?', [id])
      return result.affectedRows > 0
    },
  }
}
