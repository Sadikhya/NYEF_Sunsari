import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { adminSections, contentCategories, defaultAdminSection, emptyForms, fieldList, filterContentRecords } from './adminConfig'

export default function AdminPanel({ onExit }) {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [section, setSection] = useState(defaultAdminSection)
  const [contentCategory, setContentCategory] = useState('all')
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(emptyForms[defaultAdminSection])
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')
  const endpoint = useMemo(() => `/api/admin/${section}`, [section])
  const visibleRecords = section === 'site-content' ? filterContentRecords(records, contentCategory) : records

  useEffect(() => {
    api.get('/api/admin/session')
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (!admin) return
    api.get(endpoint).then(setRecords).catch((error) => setNotice(error.message))
    setForm(emptyForms[section])
    setEditing(null)
    setContentCategory('all')
  }, [admin, endpoint, section])

  async function login(event) {
    event.preventDefault()
    setNotice('')
    try {
      const data = await api.post('/api/admin/login', loginForm)
      setAdmin(data.admin)
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function logout() {
    await api.post('/api/admin/logout', {}).catch(() => null)
    setAdmin(null)
    onExit?.()
  }

  async function save(event) {
    event.preventDefault()
    setNotice('')
    const payload = { ...form }
    if (section === 'team-members') {
      payload.display_order = Number(payload.display_order || 0)
      payload.is_published = Boolean(payload.is_published)
    }
    try {
      if (editing) await api.put(`${endpoint}/${editing.id || editing.content_key}`, payload)
      else await api.post(endpoint, payload)
      setRecords(await api.get(endpoint))
      setForm(emptyForms[section])
      setEditing(null)
      setNotice('Saved.')
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function remove(record) {
    if (!window.confirm('Delete this record?')) return
    const id = record.id || record.content_key
    await api.delete(`${endpoint}/${id}`)
    setRecords(await api.get(endpoint))
    setNotice('Deleted.')
  }

  function edit(record) {
    setEditing(record)
    setForm({ ...emptyForms[section], ...record, is_published: record.is_published === 1 || record.is_published === true })
  }

  if (checking) return <section className="px-6 py-20 text-center">Checking admin session...</section>

  if (!admin) {
    return <section className="min-h-screen bg-slate-100 px-6 py-20">
      <form onSubmit={login} className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-800">Admin Login</h1>
        {notice && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{notice}</p>}
        <label className="mb-4 block font-semibold">Email<input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3" required /></label>
        <label className="mb-6 block font-semibold">Password<input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3" required /></label>
        <button type="submit" className="w-full rounded-xl bg-sky-500 px-5 py-3 font-bold text-white">Log In</button>
      </form>
    </section>
  }

  return <section className="min-h-screen bg-slate-100">
    <div className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-800">NYEF Admin</h1>
        <div className="flex flex-wrap gap-2">
          {adminSections.map(([id, label]) => <button key={id} type="button" onClick={() => setSection(id)} className={`rounded-lg px-4 py-2 font-semibold ${section === id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>)}
          <button type="button" onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Logout</button>
        </div>
      </div>
    </div>

    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr]">
      <form onSubmit={save} className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold text-slate-800">{editing ? 'Edit' : 'Add'} {adminSections.find(([id]) => id === section)?.[1]}</h2>
        {fieldList(section).map((field) => field === 'category'
          ? <label key={field} className="mb-4 block font-semibold capitalize">{field.replace('_', ' ')}<select value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3"><option value="executive_committee">Executive Committee</option><option value="past_president">Past President</option><option value="general_member">General Member</option></select></label>
          : field === 'is_published'
            ? <label key={field} className="mb-4 flex items-center gap-3 font-semibold"><input type="checkbox" checked={Boolean(form[field])} onChange={(event) => setForm({ ...form, [field]: event.target.checked })} /> Published</label>
            : field === 'body'
              ? <label key={field} className="mb-4 block font-semibold capitalize">{field}<textarea value={form[field] || ''} onChange={(event) => setForm({ ...form, [field]: event.target.value })} rows="5" className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>
              : <label key={field} className="mb-4 block font-semibold capitalize">{field.replace('_', ' ')}<input type="text" value={form[field] ?? ''} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 p-3" /></label>)}
        <button type="submit" className="w-full rounded-xl bg-sky-500 px-5 py-3 font-bold text-white">Save</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForms[section]) }} className="mt-3 w-full rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700">Cancel</button>}
        {notice && <p role="status" className="mt-4 rounded-lg bg-sky-50 p-3 text-sky-800">{notice}</p>}
      </form>

      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Records</h2>
          {section === 'site-content' && <div role="tablist" aria-label="Content categories" className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
            {contentCategories.map(([id, label]) => <button key={id} role="tab" aria-selected={contentCategory === id} type="button" onClick={() => setContentCategory(id)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${contentCategory === id ? 'bg-sky-500 text-white shadow' : 'text-slate-600 hover:bg-white'}`}>{label}</button>)}
          </div>}
        </div>
        {visibleRecords.length === 0
          ? <p className="text-slate-500">No records yet.</p>
          : <div className="grid gap-3">{visibleRecords.map((record) => <article key={record.id || record.content_key} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold text-slate-800">{record.name || record.title}</h3><p className="text-sm text-slate-500">{record.business || record.position || record.content_key}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(record)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">Edit</button><button type="button" onClick={() => remove(record)} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Delete</button></div></div></article>)}</div>}
      </div>
    </div>
  </section>
}
