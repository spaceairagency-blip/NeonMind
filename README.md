# NeonMind

Single-file AI chatbot (Groq) with a 20-chats-per-24h client-side limit shown as 20 colored bars.

## Structure

```
index.html       the whole app (HTML + CSS + JS)
api/chat.js      optional Vercel proxy that keeps GROQ_API_KEY server-side
.env.example     copy to .env.local for `vercel dev`
.gitignore
```

## Run

- **Quick local test:** open `index.html`, click the key icon, paste your Groq key (stored in localStorage).
- **Vercel (recommended):** deploy this folder, add `GROQ_API_KEY` under Project Settings -> Environment Variables. With no browser-side key, the app calls `/api/chat` automatically.
- **Local with proxy:** `cp .env.example .env.local`, set the key, run `vercel dev`.

## Notes

- The daily limit lives in localStorage, so it deters casual use only. For a hard limit, enforce it in `api/chat.js`.
- Ad rails (HilltopAds) show on screens 1180px wide and up.
