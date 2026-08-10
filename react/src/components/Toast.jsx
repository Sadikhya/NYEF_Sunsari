export default function Toast({ visible }) {
  return <div role="status" aria-live="polite" className={`fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-green-500 px-5 py-4 font-semibold text-white shadow-xl transition-all ${visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'}`}>{visible ? 'Your message has been sent!' : ''}</div>
}
