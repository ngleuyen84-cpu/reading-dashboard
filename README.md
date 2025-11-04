# Reading Dashboard (Next.js)

Setup:
1. Create Supabase project and run SQL to create tables.
2. Add environment variables to Vercel:
   - SUPABASE_URL
   - SUPABASE_KEY
   - OPENAI_API_KEY
   - GOOGLE_BOOKS_KEY (optional)
   - NEWSAPI_KEY (optional)
   - CRON_SECRET (string)
   - NEXT_PUBLIC_TIMEZONE = Asia/Ho_Chi_Minh
3. Deploy to Vercel (Import GitHub repo).
4. Set GitHub Action secrets: SITE_URL and CRON_SECRET.

Usage:
- Admin page `/admin` to manually refresh or import books.
- Homepage lists latest insights; Ask Philo / Ask Lit; Notes + feedback.
