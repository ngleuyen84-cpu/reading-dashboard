import OpenAI from 'openai'
import { supabase } from '../../../../lib/supabaseClient'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res){
  const { id } = req.query
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { data: note } = await supabase.from('notes').select('*').eq('id', id).single()
    const prompt = `Bạn là một mentor. Người dùng viết: "${note.body}". Hãy tóm tắt 2 câu, chỉ ra 3 điểm có thể cải thiện và đề xuất 3 tài liệu tiếp theo (title + 1 câu). Trả về JSON.`
    const g = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role:'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 400
    })
    const txt = g.choices?.[0]?.message?.content || ''
    let feedback = {}
    try{ feedback = JSON.parse(txt) }catch(e){ feedback = { text: txt } }
    const { data } = await supabase.from('notes').update({ feedback }).eq('id', id).select().single()
    res.json(data)
  }catch(e){ console.error(e); res.status(500).json({ error: String(e) }) }
}
