import Link from "next/link";
import { InfoIcon, PlayIcon, ShieldIcon } from "@/components/Icons";
import { Row } from "@/components/Row";
import type { BrowseDTO } from "@/lib/types";

export function BrowseView({ data }: { data: BrowseDTO }) {
  const hero = data.rows.find((row) => row.id === "trending")?.items[0];
  const minutes = data.continueWatching.reduce(
    (sum, item) => sum + Math.round(item.positionSeconds / 60),
    0,
  );

  return (
    <div className="rr-fade">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Your room</p>
          <h1 className="display text-3xl md:text-4xl">Good to see you, {data.profile.name}</h1>
        </div>
        <p className="flex items-center gap-2 rounded-lg border border-line bg-raised px-4 py-2 text-xs text-muted">
          {data.profile.kids ? (
            <><ShieldIcon className="h-4 w-4 text-good" /> Kids profile · limit {data.profile.maxRating}</>
          ) : (
            <><ShieldIcon className="h-4 w-4 text-accent" /> Full catalogue · limit {data.profile.maxRating}</>
          )}
        </p>
      </header>

      {hero ? (
        <section
          className="relative mb-12 flex min-h-[380px] items-end overflow-hidden rounded-2xl border border-line bg-cover bg-center p-7 md:min-h-[460px] md:p-12"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(14,17,22,.97) 0%, rgba(14,17,22,.82) 42%, rgba(14,17,22,.25) 100%), url(${hero.thumbnailUrl})` }}
          aria-label={`Featured title: ${hero.title}`}
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Featured tonight</p>
            <h2 className="display mb-4 text-4xl leading-tight md:text-6xl">{hero.title}</h2>
            <p className="mb-4 flex flex-wrap items-center gap-2 text-xs text-cream/80">
              <span>{hero.year}</span><span>·</span><span>{hero.maturityLabel}</span><span>·</span>
              <span>{hero.genres.join(" / ")}</span><span>·</span><span>{hero.durationMinutes} min</span>
            </p>
            <p className="mb-7 max-w-xl text-sm leading-relaxed text-muted md:text-base">{hero.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/watch/${hero.id}`}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-ink transition hover:bg-accent-bright">
                <PlayIcon className="h-4 w-4" /> Play
              </Link>
              <Link href={`/title/${hero.id}`}
                className="flex items-center gap-2 rounded-xl border border-cream/30 bg-ink/40 px-6 py-3 font-semibold text-cream backdrop-blur transition hover:border-accent">
                <InfoIcon className="h-4 w-4" /> More details
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-12 rounded-2xl border border-dashed border-line bg-raised p-10 text-center text-muted">
          The catalogue is empty for this profile. Add titles to the catalogue to start browsing.
        </section>
      )}

      <section className="mb-12" aria-labelledby="continue-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="continue-heading" className="display text-xl md:text-2xl">Continue watching</h2>
            <p className="mt-0.5 text-xs text-muted">Right where you stopped · {minutes} min in progress</p>
          </div>
        </div>
        {data.continueWatching.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-raised px-5 py-8 text-center text-sm text-muted">
            Nothing in progress. Pick something from the rows below and it will appear here.
          </div>
        ) : (
          <div className="rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {data.continueWatching.map((item) => (
              <Link key={item.id} href={`/watch/${item.titleId}`} className="group block w-44 shrink-0 md:w-48" aria-label={`Resume ${item.titleName}`}>
                <div className="poster-shell relative aspect-video overflow-hidden rounded-xl border border-line transition group-hover:border-accent"
                  style={{ backgroundImage: `url(${item.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-ink"><PlayIcon /></span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-cream/20" role="progressbar" aria-valuenow={item.percent} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-accent" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
                <p className="mt-2 truncate text-sm font-medium text-cream">{item.titleName}</p>
                <p className="text-xs text-muted">{item.percent}% watched · {Math.round((item.durationSeconds - item.positionSeconds) / 60)} min left</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {data.rows.map((row) => <Row key={row.id} row={row} />)}

      <footer className="border-t border-line pt-6 text-xs text-muted">
        Recommendations are computed from this profile&apos;s genres, likes and completed titles.
      </footer>
    </div>
  );
}
