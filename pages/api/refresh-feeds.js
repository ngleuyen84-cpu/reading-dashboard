import Parser from 'rss-parser'
import { supabase } from '../../lib/supabaseClient'
import OpenAI from 'openai'
import fetch from 'node-fetch'
import { detect } from 'langdetect'

const parser = new Parser()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FEEDS = [
  // english
  'https://hbr.org/rss',
  'https://www.wellandgood.com/feed/',
  'https://www.healthline.com/rss',
  // vietnamese examples
  'https://vnexpress.net/rss/suc-khoe.rss',
  'https://vietnamnet.vn/rss/suc-khoe.rss',
  // add more sources as needed
]

function makeSummaryPrompt(text, lang='en'){
  if(lang.startsWith('vi')) {
    return `Tóm tắt ngắn gọn bài viết sau bằng tiếng Việt. Trả về JSON: {"bullets": ["...","...","..."], "action":"..."}\n\nBài: ${text.slice(0,3000)}`
  }
  return `Summarize the article below in 3 concise bullet points and 1 short action item. Return JSON: {"bullets": [...], "action": "..."}\n\nArticle:\n${text.slice(0,3000)}`
}

export default async function handler(req, res){
  // simple secret check
  const secret = req.body?.secret || req.query?.secret
  if(secret !== process.env.CRON_SECRET) return res.status(401).json({error:'unauthorized'})

  try{
    for(const feedUrl of FEEDS){
      const feed = await parser.parseURL(feedUrl)
      for(const item of feed.items.slice(0,10)){
        // dedupe by link
        const { data: exists } = await supabase
          .from('articles')
          .select('id')
          .eq('url', item.link)
          .limit(1)

        if(exists?.length) continue

        // fetch content (try content:encoded or fetch page)
        let content = item['content:encoded'] || item.content || item.summary || ''
        if(!content && item.link){
          try{
            const r = await fetch(item.link)
            content = await r.text()
          }catch(e){ console.warn('fetch fail', e) }
        }

        const lang = (() => {
          try{ return detect((content||item.title).slice(0,200)) }catch(e){ return 'en' }
        })()

        // call OpenAI summarize
        const prompt = makeSummaryPrompt(content || item.title, lang)
        let summaryJSON = {}
        try{
          const g = await openai.chat.completions.create({
            model: 'gpt-5',
            messages: [{ role:'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 300
          })
          const txt = g.choices?.[0]?.message?.content || ''
          // try parse JSON
          try{ summaryJSON = JSON.parse(txt) }catch(e){
            // fallback: wrap text
            summaryJSON = { text: txt }
          }
        }catch(e){ console.error('openai fail', e); summaryJSON = { text: '' } }

        // insert to supabase
        await supabase.from('articles').insert([{
          title: item.title,
          url: item.link,
          source: feed.title || feedUrl,
          published_at: item.isoDate || item.pubDate || new Date().toISOString(),
          lang,
          summary: summaryJSON,
          content: content
        }])
      }
    }

    return res.json({ ok: true })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error: String(e) })
  }
}
