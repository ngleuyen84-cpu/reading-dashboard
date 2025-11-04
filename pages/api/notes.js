import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res){
  if(req.method === 'POST'){
    const { title, body, user_id } = req.body
    const { data, error } = await supabase.from('notes').insert([{ title, body, user_id }]).select().single()
    if(error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }
  // GET
  const user_id = req.query.user_id || 'me'
  const { data, error } = await supabase.from('notes').select('*').eq('user_id', user_id).order('created_at', { ascending: false })
  if(error) return res.status(500).json({ error: error.message })
  res.json(data)
}
