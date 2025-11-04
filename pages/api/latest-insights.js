import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res){
  try{
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)
    res.json(data)
  }catch(e){ res.status(500).json({error: String(e)}) }
}
