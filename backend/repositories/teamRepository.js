export function createTeamRepository(database) {
  const fields = 'id, name, position, category, term, business, contact, address, profile_picture, display_order, is_published, created_at, updated_at'

  return {
    async listAdmin() {
      const [rows] = await database.execute(`SELECT ${fields} FROM team_members ORDER BY category, display_order, id`)
      return rows
    },

    async listPublic() {
      const [rows] = await database.execute(
        `SELECT id, name, position, category, term, business, contact, address, profile_picture, display_order
         FROM team_members
         WHERE is_published = 1
         ORDER BY
           FIELD(category, 'executive_committee', 'past_president', 'general_member'),
           CASE
             WHEN UPPER(position) = 'PRESIDENT' THEN 1
             WHEN UPPER(position) = 'IMMEDIATE PAST PRESIDENT' THEN 2
             WHEN UPPER(position) LIKE '%VICE PRESIDENT%' THEN 3
             WHEN UPPER(position) LIKE '%EXECUTIVE MEMBER%' THEN 4
             WHEN UPPER(position) LIKE '%MEMBER%' THEN 4
             ELSE 99
           END,
           display_order,
           id`,
      )
      return rows
    },

    async findById(id) {
      const [rows] = await database.execute(`SELECT ${fields} FROM team_members WHERE id = ? LIMIT 1`, [id])
      return rows[0] || null
    },

    async create(member) {
      const [result] = await database.execute(
        `INSERT INTO team_members
          (name, position, category, term, business, contact, address, profile_picture, display_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [member.name, member.position, member.category, member.term, member.business, member.contact, member.address, member.profile_picture, member.display_order, member.is_published],
      )
      return this.findById(result.insertId)
    },

    async update(id, member) {
      const [result] = await database.execute(
        `UPDATE team_members
         SET name = ?, position = ?, category = ?, term = ?, business = ?, contact = ?, address = ?, profile_picture = ?, display_order = ?, is_published = ?
         WHERE id = ?`,
        [member.name, member.position, member.category, member.term, member.business, member.contact, member.address, member.profile_picture, member.display_order, member.is_published, id],
      )
      return result.affectedRows ? this.findById(id) : null
    },

    async remove(id) {
      const [result] = await database.execute('DELETE FROM team_members WHERE id = ?', [id])
      return result.affectedRows > 0
    },
  }
}
