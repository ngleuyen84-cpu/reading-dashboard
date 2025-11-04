import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res){
  try{
    const { q = '', kind = 'philo' } = req.body
    if(!q) return res.json([])
    // simple full text search: use ilike on title/description/tags
    const like = `%${q}%`
    const { data } = await supabase
      .from('books')
      .select('*')
      .or(`title.ilike.${like},description.ilike.${like},tags.cs.{${q}}`)
      .limit(20)
    // fallback: return top N
    res.json(data || [])
  }catch(e){ console.error(e); res.status(500).json({error: String(e)}) }
}
