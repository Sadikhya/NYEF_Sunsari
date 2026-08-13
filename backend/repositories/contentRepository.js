export function createContentRepository(database) {
  return {
    async list() {
      const [rows] = await database.execute('SELECT content_key, title, body, image_url, updated_at FROM site_content ORDER BY content_key')
      return rows
    },

    async findByKey(key) {
      const [rows] = await database.execute('SELECT content_key, title, body, image_url, updated_at FROM site_content WHERE content_key = ? LIMIT 1', [key])
      return rows[0] || null
    },

    async upsert(content) {
      await database.execute(
        `INSERT INTO site_content (content_key, title, body, image_url)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), image_url = VALUES(image_url)`,
        [content.content_key, content.title, content.body, content.image_url],
      )
      return this.findByKey(content.content_key)
    },

    async remove(key) {
      const [result] = await database.execute('DELETE FROM site_content WHERE content_key = ?', [key])
      return result.affectedRows > 0
    },
  }
}
