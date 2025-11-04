import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [books, setBooks] = useState([])
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState([])

  useEffect(()=>{ fetchInsights() ; fetchNotes() }, [])

  async function fetchInsights(){
    setLoading(true)
    try{
      const r = await axios.get('/api/latest-insights')
      setInsights(r.data || [])
    }catch(e){ console.error(e); alert('Không fetch được insights') }
    setLoading(false)
  }

  async function refreshNow(){
    setLoading(true)
    try{
      await axios.post('/api/refresh-feeds', { secret: process.env.NEXT_PUBLIC_CRON_SECRET || '' })
      await fetchInsights()
      alert('Refreshed')
    }catch(e){ console.error(e); alert('Refresh failed') }
    setLoading(false)
  }

  async function askBooks(kind){
    if(!q) return alert('Viết câu hỏi hoặc chủ đề vào ô tìm kiếm')
    const r = await axios.post('/api/ask-books', { q, kind })
    setBooks(r.data || [])
  }

  async function saveNote(){
    if(!note) return alert('Viết note trước khi save')
    const r = await axios.post('/api/notes', { title: note.slice(0,60), body: note, user_id: 'me' })
    setNote('')
    fetchNotes()
  }

  async function fetchNotes(){
    const r = await axios.get('/api/notes?user_id=me')
    setNotes(r.data || [])
  }

  async function requestFeedback(id){
    const r = await axios.post(`/api/notes/${id}/feedback`)
    alert('Feedback generated')
    fetchNotes()
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reading Dashboard</h1>
        <div className="space-x-3">
          <button onClick={refreshNow} className="px-3 py-1 bg-blue-600 text-white rounded">{loading? '...' : 'Refresh Now'}</button>
          <a className="px-3 py-1 bg-gray-200 rounded" href="/admin">Admin</a>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        <section className="col-span-8">
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Today's Insights</h2>
              <div className="text-sm text-gray-500">Auto-updated hourly</div>
            </div>
            <div className="space-y-3">
              {insights.length===0 && <div className="text-sm text-gray-500">No insights yet — click Refresh or wait hourly.</div>}
              {insights.map(it=>(
                <article key={it.id} className="p-3 border rounded">
                  <a className="font-semibold text-sm" href={it.url} target="_blank" rel="noreferrer">{it.title}</a>
                  <div className="text-xs text-gray-500">{new Date(it.published_at).toLocaleString()}</div>
                  <div className="mt-2 text-sm">{(it.summary && it.summary.bullets)? it.summary.bullets.join(' • '): (it.summary?.text || '')}</div>
                  <div className="mt-2 text-xs text-gray-500">Source: {it.source}</div>
                </article>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Daily Notes & Feedback</h3>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder="Ghi lại điều học hôm nay..."></textarea>
            <div className="flex gap-2 mt-2">
              <button onClick={saveNote} className="px-3 py-1 bg-green-600 text-white rounded">Save note</button>
              <button onClick={fetchNotes} className="px-3 py-1 border rounded">Reload notes</button>
            </div>

            <div className="mt-4 space-y-2">
              {notes.map(n=>(
                <div className="p-2 border rounded" key={n.id}>
                  <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                  <div className="mt-1 text-sm">{n.body}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>requestFeedback(n.id)} className="text-xs px-2 py-1 bg-indigo-50 rounded">Get feedback</button>
                    {n.feedback && <div className="text-xs text-gray-600">Feedback: {n.feedback.summary?.slice(0,120)}...</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="col-span-4 space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Ask Philo / Lit</h3>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. meaning of work; grief" className="w-full p-2 border rounded mb-2" />
            <div className="flex gap-2">
              <button onClick={()=>askBooks('philo')} className="flex-1 py-2 bg-indigo-600 text-white rounded">Philo</button>
              <button onClick={()=>askBooks('lit')} className="flex-1 py-2 bg-rose-600 text-white rounded">Literature</button>
            </div>
            <div className="mt-3 space-y-2">
              {books.map(b=>(
                <div key={b.id} className="p-2 border rounded">
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-xs text-gray-500">{(b.authors||[]).join(', ')} • {b.publisher}</div>
                  <div className="text-sm mt-1">{b.description?.slice(0,140)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium">Quick Tips</h3>
            <ul className="text-sm list-disc pl-5 mt-2">
              <li>Feeds update hourly automatically.</li>
              <li>Use Ask to get recommended books.</li>
              <li>Save notes and request feedback.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
