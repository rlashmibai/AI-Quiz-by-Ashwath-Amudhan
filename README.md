# Artificial Intelligence Quiz — Tricky Toddlers

A minimalist, mobile-friendly Next.js + TypeScript + Tailwind CSS quiz built for parents, teachers, and students visiting the **Tricky Toddlers** school innovation exhibition.

## Editing Quiz Questions & Images

1. Open `src/data/questions.ts` to edit or replace the quiz questions, options, correct answers, explanations, and image paths.
2. Place any local quiz images inside `public/images/` and reference them as `/images/your-image.jpg`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket (or use the Vercel CLI).
2. Import the project in [Vercel](https://vercel.com/new) — Vercel automatically detects **Next.js** and uses `npm run build` with zero extra configuration.
3. Or deploy directly via the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```
