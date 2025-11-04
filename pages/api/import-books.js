import axios from 'axios'
import { supabase } from '../../lib/supabaseClient'

const QUERIES = [
  'philosophy classic',
  'existentialism',
  'Stoicism',
  'Vietnamese classic literature',
  'classic literature world'
]

export default async function handler(req, res){
  const secret = req.body?.secret
  if(secret !== process.env.CRON_SECRET) return res.status(401).json({error:'unauthorized'})
  try{
    for(const q of QUERIES){
      const r = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: { q, key: process.env.GOOGLE_BOOKS_KEY, maxResults: 20 }
      })
      for(const item of r.data.items || []){
        const v = item.volumeInfo
        // upto you to filter by publisher/ratings
        await supabase.from('books').insert([{
          title: v.title,
          authors: v.authors || [],
          publisher: v.publisher || null,
          published_date: v.publishedDate || null,
          description: v.description || null,
          tags: v.categories || [],
          metadata: item
        }])
      }
    }
    return res.json({ ok: true })
  }catch(e){ console.error(e); res.status(500).json({ error: String(e) }) }
}
