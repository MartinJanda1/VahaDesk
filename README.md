# VahaDesk

Interpretace CSV z **TrueLife FitScale W8 BT**: profily, trendy v čase a krátká edukace parametrů (čeština).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Neon Postgres + Drizzle ORM
- Recharts + PapaParse

Bez `DATABASE_URL` běží lokální JSON úložiště v `.data/` (jen pro vývoj).

## Spuštění

```bash
npm install
cp .env.example .env.local   # volitelně doplňte DATABASE_URL
npm run dev                  # http://127.0.0.1:43147
```

Ukázkové CSV: [`public/samples/truelife-fitscale-sample.csv`](public/samples/truelife-fitscale-sample.csv).

### Migrace (Neon)

```bash
npm run db:push
```

Nebo při prvním requestu aplikace vytvoří tabulky přes `ensureSchema()`.

## Vercel

- Projekt: [`vahadesk`](https://vercel.com/janda3/vahadesk)
- Produkce: [https://vahadesk.vercel.app](https://vahadesk.vercel.app)
- Neon: `vahadesk-db` (Free) → `DATABASE_URL` pro Production / Preview / Development

Privátní GitHub `MartinJanda1/VahaDesk` je zdroj pravdy. Automatický deploy po pushi vyžaduje, aby měl Vercel GitHub App přístup k tomuto repu (GitHub → Settings → Applications → Vercel → Repository access).
