import Link from "next/link";
import { ChevronLeft, ClockIcon, PlayIcon, ShieldIcon, StarIcon } from "@/components/Icons";
import { ReactionButtons } from "@/components/ReactionButtons";
import { WatchlistButton } from "@/components/WatchlistButton";
import type { TitleDetailDTO } from "@/lib/types";

export function TitleDetailView({ title }: { title: TitleDetailDTO }) {
  return (
    <div className="rr-fade">
      <Link href="/browse" className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-cream">
        <ChevronLeft className="h-4 w-4" /> Back to browse
      </Link>

      <section
        className="relative mb-10 flex min-h-[360px] items-end overflow-hidden rounded-2xl border border-line bg-cover bg-center p-7 md:min-h-[440px] md:p-12"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(14,17,22,.97) 0%, rgba(14,17,22,.8) 48%, rgba(14,17,22,.25) 100%), url(${title.thumbnailUrl})` }}
        aria-label={`${title.title} details`}
      >
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {title.type === "series" ? "Series" : "Film"}
          </p>
          <h1 className="display mb-4 text-4xl md:text-6xl">{title.title}</h1>
          <p className="mb-5 flex flex-wrap items-center gap-3 text-xs text-cream/80">
            <span className="flex items-center gap-1"><StarIcon className="h-4 w-4 text-accent" /> {title.rating.toFixed(1)}</span>
            <span>{title.year}</span>
            <span className="flex items-center gap-1"><ShieldIcon className="h-4 w-4" /> {title.maturityLabel}</span>
            <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {title.durationMinutes} min</span>
          </p>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted md:text-base">{title.description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/watch/${title.id}`}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-ink hover:bg-accent-bright">
              <PlayIcon className="h-4 w-4" /> Play
            </Link>
            <WatchlistButton titleId={title.id} initialInList={title.inWatchlist} />
            <ReactionButtons titleId={title.id} initial={title.reaction} />
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <h2 className="display mb-4 text-2xl">
            {title.type === "series" ? "Episodes" : "About this film"}
          </h2>
          {title.type === "series" ? (
            title.seasons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-raised px-5 py-8 text-sm text-muted">
                Episodes have not been added for this series yet.
              </p>
            ) : (
              <div className="space-y-3">
                {title.seasons.map((season) => (
                  <details key={season.id} className="group rounded-xl border border-line bg-raised" open={season.seasonNumber === 1}>
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-cream">
                      <span>Season {season.seasonNumber} <span className="ml-2 font-normal text-muted">{season.year}</span></span>
                      <span className="text-xs font-normal text-muted">{season.episodeCount} episodes</span>
                    </summary>
                    <div className="border-t border-line px-5 py-2">
                      {season.episodes.length === 0 ? (
                        <p className="py-4 text-sm text-muted">No episode details available.</p>
                      ) : (
                        season.episodes.map((episode) => (
                          <Link key={episode.id} href={`/watch/${title.id}?episode=${episode.id}`}
                            className="flex gap-4 border-b border-line/60 py-4 last:border-0 hover:bg-card/40">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-sm font-semibold text-accent">
                              {episode.episodeNumber}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="font-medium text-cream">{episode.name}</h3>
                                <span className="text-xs text-muted">{episode.durationMinutes} min</span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-muted">{episode.description}</p>
                            </div>
                            <PlayIcon className="mt-2 h-4 w-4 shrink-0 text-accent" />
                          </Link>
                        ))
                      )}
                    </div>
                  </details>
                ))}
              </div>
            )
          ) : (
            <p className="rounded-xl border border-line bg-raised p-5 text-sm leading-relaxed text-muted">
              A {title.durationMinutes}-minute {title.genres.join(" / ").toLowerCase()} film starring {title.cast.join(", ") || "an ensemble cast"}.
              {title.description}
            </p>
          )}
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border border-line bg-raised p-5">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {title.genres.map((genre) => (
                <Link key={genre} href={`/search?genre=${encodeURIComponent(genre)}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-cream hover:border-accent">
                  {genre}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Cast</h2>
            <p className="text-sm text-muted">{title.cast.join(" · ") || "Not listed"}</p>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Rating guidance</h2>
            <p className="flex items-center gap-2 text-sm text-muted">
              <ShieldIcon className="h-4 w-4 text-good" /> {title.maturityLabel} · allowed on this profile
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
