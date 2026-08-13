export function validateContent(body) {
  const contentKey = String(body?.content_key || '').trim()
  const title = String(body?.title || '').trim()
  const bodyText = String(body?.body || '').trim()
  const imageUrl = String(body?.image_url || '').trim() || null

  if (!/^[a-z0-9_-]{2,80}$/.test(contentKey)) return { error: 'content_key must use letters, numbers, underscores, or dashes' }
  if (!title) return { error: 'title is required' }
  if (!bodyText) return { error: 'body is required' }

  return { value: { content_key: contentKey, title, body: bodyText, image_url: imageUrl } }
}
