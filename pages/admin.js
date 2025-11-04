import React, {useState} from 'react'
import axios from 'axios'

export default function Admin(){
  const [status, setStatus] = useState('')

  async function refresh(){
    setStatus('Refreshing...')
    try{
      await axios.post('/api/refresh-feeds', { secret: process.env.NEXT_PUBLIC_CRON_SECRET || '' })
      setStatus('Done')
    }catch(e){ console.error(e); setStatus('Failed') }
  }

  async function importBooks(){
    setStatus('Importing books...')
    try{
      await axios.post('/api/import-books', { secret: process.env.NEXT_PUBLIC_CRON_SECRET || '' })
      setStatus('Books imported')
    }catch(e){ console.error(e); setStatus('Failed') }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-xl mb-4">Admin</h1>
      <div className="space-x-2">
        <button onClick={refresh} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh feeds</button>
        <button onClick={importBooks} className="px-3 py-1 bg-green-600 text-white rounded">Import book catalog</button>
      </div>
      <div className="mt-4">Status: {status}</div>
    </div>
  )
}
