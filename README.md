# Fry-Day House

A mobile-first, WhatsApp-first restaurant website for Fry-Day House in Bahawalpur, Pakistan. Built with Next.js App Router, React, Tailwind CSS v4 and Framer Motion.

## Requirements

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm

## Run locally

```bash
npm install
cp .env.example .env.local
npm run validate:data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm run start
```

## Environment variables

Set `NEXT_PUBLIC_SITE_URL` to the public website URL. For local development, use `http://localhost:3000`; for production, use your deployed domain.

## Project structure

- `app/` - Next.js routes, global styles, metadata, robots and sitemap
- `components/` - responsive restaurant website and interactive ordering experience
- `data/` - editable business details, menu, deals and page content
- `lib/` - data loading and TypeScript types
- `public/images/` - bundled SVG artwork used by the site

## Content updates

Menu items, prices, categories, deals and business information are maintained in the JSON files under `data/`. Run `npm run validate:data` after editing them.

## Deploy

Import this repository into Vercel, keep the detected Next.js settings, and add `NEXT_PUBLIC_SITE_URL` in the project's Environment Variables before deploying.

The gallery artwork currently uses editable SVG illustrations. Replace those files in `public/images/` with approved restaurant photography when available.
