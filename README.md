# REELROOM — a reference implementation inspired by Netflix

A full-stack streaming-platform reference built with Next.js 16 App Router, React 19, Tailwind 4,
TypeScript, MongoDB/Mongoose, bcryptjs, `jose` JWT cookies and zod. It is designed as a realistic,
self-contained codebase: domain logic, permissions, state transitions, ranking, parental controls
and reports are all real. The only external system that is simulated is media playback.

## What is implemented

- **Accounts & sessions** — register, login, logout, `me`; bcrypt hashes, HS256 JWT in an HTTP-only
  cookie, rate-limited public auth endpoints, duplicate-email `409`.
- **Five profiles per account** — create, rename, recolour, delete, switch. Deleting a profile
  removes only that profile's list/reactions/progress; the last profile cannot be deleted.
- **Parental controls** — kids profiles are limited to G/PG/PG-13. The limit is enforced on every
  read path (browse, search, title lists, detail, episodes, recommendations, player) and every
  write path (watchlist, reaction, progress).
- **Catalogue** — 71 movies and series with genres, year, rating, maturity, cast, descriptions,
  local SVG posters and duration; 75 seasons and 594 episodes.
- **Discovery** — trending / newly-added / top-rated rows, a per-profile recommendation row backed
  by genre affinity from likes and watch history, a "from your likes" row, continue-watching,
  full-text search with type/genre/year filters and four sorts, bounded pagination everywhere.
- **Assignment workflow** — per-profile watchlist with duplicate protection (`409`), stale-title
  detection, cross-profile isolation and a 100-title cap.
- **Engagement** — likes/dislikes, atomic progress upserts with duration validation and completion
  tracking, episode-level progress, a simulated player with timeline and explicit save actions.
- **Reports** — per-profile dashboard with MongoDB aggregations for time watched, completed
  titles, series finished, completion rate, top genres and recent activity.
- **UI** — original "cinematic editorial" identity: warm amber accent on ink/charcoal neutrals,
  serif display type, inline SVG icon set, poster rails, deliberate empty states, skeletons,
  error boundaries, accessible labels, visible focus and responsive layouts.

## Stack & local setup

Requirements: Node.js 20.9+, npm, MongoDB running on `127.0.0.1:27017` (or a custom URI).

```bash
cd netflix-reference
npm install
cp .env.example .env.local      # adjust if your MongoDB/JWT secret differ
npm run seed                    # wipes ONLY the netflix_ref database and rebuilds it
npm run build && npm start -- -p 3239
```

Development: `npm run dev`. Quality gates: `npm run lint`, `npm run typecheck`, `npm run build`.

### Environment

| Variable | Example | Notes |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/netflix_ref` | Seed refuses to run against any other database name. |
| `JWT_SECRET` | a long random string | Change before any real deployment. |

### Demo accounts

All demo passwords are `password123`.

| Account | Profiles |
| --- | --- |
| `alex@reelroom.dev` | Alex (18), Mateo (kids, G), Nova (16) |
| `priya@reelroom.dev` | Priya (18), Zoe (kids, PG-13) |
| `marcus@reelroom.dev` | Marcus (16), Iris (PG-13) |
| `sofia@reelroom.dev` | Sofia (18), Jun (kids, G) |

## API

All endpoints except `register`, `login` and the public landing/auth pages require the JWT cookie.
List endpoints accept `page` (1–10000) and `limit` (1–100); invalid values return `400`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account + first profile; sets session |
| POST | `/api/auth/login` | Verify credentials; sets session |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Current account |
| GET / POST | `/api/profiles` | List / create profile (max 5) |
| GET / PATCH / DELETE | `/api/profiles/[id]` | Profile detail / edit / delete with cleanup |
| POST | `/api/profiles/[id]/switch` | Set active profile (must belong to account) |
| GET | `/api/titles` | Filter (`type`, `genre`, `yearFrom`, `yearTo`), sort, paginate |
| GET | `/api/titles/[id]` | Detail with seasons and episodes |
| GET | `/api/titles/[id]/episodes` | Episode list for a series |
| POST | `/api/titles/[id]/reaction` | `like`, `dislike` or `clear` |
| GET | `/api/browse` | Ranked rows + continue-watching for active profile |
| GET | `/api/search` | Full-text search with filters and sort |
| GET | `/api/recommendations` | Genre-affinity ranking (`matchScore`, `reason`) |
| GET / POST | `/api/watchlist` | List / add titles for active profile |
| DELETE | `/api/watchlist/[titleId]` | Remove title from active profile's list |
| GET | `/api/progress` | Paginated watch history |
| PUT | `/api/progress/[titleId]` | Atomic progress upsert with duration validation |
| GET | `/api/player/[titleId]` | Playback info from the media adapter |
| GET | `/api/dashboard` | Per-profile aggregated activity report |

## Simulation boundary and swap path

**What is simulated:** playback media only. `lib/media-adapter.ts` exposes a `MediaAdapter`
interface; `PlaceholderMediaAdapter.getPlaybackUrl()` returns a local, non-fetched placeholder URL
(`/media/placeholder-reel?...`) and marks `simulated: true`. The `/watch/[id]` player advances a
timeline locally and persists real progress through `PUT /api/progress/[titleId]`. All ranking,
progress, parental-control, watchlist and report logic is real.

**Swap path:** implement `HttpMediaAdapter` against a real provider (e.g. `MEDIA_PROVIDER_URL` and
`MEDIA_API_KEY`), validate the title/episode and profile maturity before requesting a signed URL,
then change the single `mediaAdapter` export in `lib/media-adapter.ts`. No domain or UI code needs
to change. No external payment, email, storage, map or crypto-provider API is used anywhere.

## Scalability choices

- Cached Mongoose connection with bounded pool (`maxPoolSize: 10`, `minPoolSize: 2`) in `lib/db.ts`.
- Index on every sort/filter path: `{type,addedAt}`, `{trendingScore}`, `{rating}`, `{genres,rating}`,
  `{year}`, `{maturity,rating}`, text index on catalogue fields, `{profile,addedAt}` watchlist,
  `{profile,updatedAt}` progress, `{profile,value}` reactions.
- Unique compound indexes for one-per-profile invariants: watchlist, reaction, progress, profile
  name per account; plus unique season/episode numbers and account email.
- Bounded pagination on all 8 list endpoints (`1–100`), `.lean()` + `.select()` projections,
  atomic `$set` upserts (progress) and guarded updates (reactions), capped embedded arrays
  (genres ≤ 8, cast ≤ 20), batch `$in` lookups (≤ 100/200/300 ids) instead of N+1 queries.
- In-memory token bucket (bounded to 1000 keys, time-pruned) on public register/login endpoints;
  duplicate email and duplicate watchlist writes return `409` idempotently.
- Seed dataset is intentionally sized (71 titles, 594 episodes, 139 watchlist items including
  3 deliberately stale ones) to exercise pagination, ranking, filtering and joins.
- `explain()` checks confirm index use, e.g. `trendingScore_-1` for browse,
  `profile_1_addedAt_-1` for watchlist, `profile_1_updatedAt_-1` for progress,
  `title_text` for search and `season_1_episodeNumber_1` for episodes.

## Verification

A single clean matrix run passed **137/137 assertions**: lint (0 errors/warnings), typecheck,
production build, seed twice-equivalent counts, auth codes, every list endpoint (pagination,
empty, filter, sort), every mutation (success + `400` + `401/403` + `404`), all seven assignment
edge cases, concurrent duplicate writes, every page status (`200/307/404`) and two clean server-log
scans.

## Known limitations & next improvements

1. Playback is simulated by design; there is no transcoding or signed media delivery.
2. Rate-limit buckets are per-process in memory; a distributed deployment should use Redis.
3. Catalogue management is seed-only; an admin surface with zod-validated CRUD would be next.
4. Search relies on MongoDB's text index (no typo tolerance); a search service would be the upgrade.
5. No email verification, password reset or multi-factor auth in this reference.
