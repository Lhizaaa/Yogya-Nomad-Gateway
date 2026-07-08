import OpenAI from 'openai'

export const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// Membaca OPENAI_API_KEY dari environment Vercel (Project Settings → Environment Variables).
export const client = new OpenAI()
