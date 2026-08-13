export default function ResourceState({ loading, error, empty, onRetry }) {
  if (loading) return <p className="py-6 text-center text-sm font-semibold text-slate-500">Loading...</p>
  if (error) return <div role="alert" className="mx-auto my-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-800"><p>Live content is unavailable right now.</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white">Retry</button>}</div>
  if (empty) return <p className="py-6 text-center text-slate-500">No records to show yet.</p>
  return null
}
