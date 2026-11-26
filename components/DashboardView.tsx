import Link from "next/link";
import { ChartIcon, CheckIcon, ClockIcon, ListIcon, PlayIcon, StarIcon, ThumbsUp } from "@/components/Icons";
import type { DashboardDTO } from "@/lib/types";

export function DashboardView({ data }: { data: DashboardDTO }) {
  const stats = [
    { label: "Watchlist", value: data.totals.watchlist, hint: "saved titles", icon: ListIcon },
    { label: "Liked", value: data.totals.liked, hint: `${data.totals.disliked} disliked`, icon: ThumbsUp },
    { label: "Completed", value: data.totals.completed, hint: `${data.totals.seriesFinished} series`, icon: CheckIcon },
    { label: "Time watched", value: data.totals.minutesWatched, hint: "minutes", icon: ClockIcon },
    { label: "Started", value: data.totals.started, hint: "titles with progress", icon: PlayIcon },
    { label: "Completion rate", value: `${data.completionRate}%`, hint: "of started titles", icon: ChartIcon },
  ];
  const maxGenre = Math.max(1, ...data.topGenres.map((genre) => genre.minutes));

  return (
    <div className="rr-fade">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Activity report</p>
        <h1 className="display text-3xl md:text-4xl">{data.profile.name}&apos;s viewing</h1>
        <p className="mt-1 text-sm text-muted">Computed from this profile&apos;s own list, reactions and watch history.</p>
      </header>

      <section aria-label="Summary statistics" className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border border-line bg-raised p-5">
            <stat.icon className="mb-3 h-5 w-5 text-accent" />
            <p className="display text-2xl text-cream">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-cream">{stat.label}</p>
            <p className="text-xs text-muted">{stat.hint}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-line bg-raised p-6" aria-labelledby="genres-heading">
          <h2 id="genres-heading" className="display mb-1 text-xl">Where the time went</h2>
          <p className="mb-6 text-xs text-muted">Minutes watched, attributed to each title&apos;s genres</p>
          {data.topGenres.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              Watch something to see your genre mix here.
            </p>
          ) : (
            <div className="space-y-4">
              {data.topGenres.map((genre) => (
                <div key={genre.genre}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-cream">{genre.genre}</span>
                    <span className="text-muted">{genre.minutes} min</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink"
                    role="meter" aria-label={`${genre.genre}: ${genre.minutes} minutes`}
                    aria-valuenow={genre.minutes} aria-valuemin={0} aria-valuemax={maxGenre}>
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(genre.minutes / maxGenre) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-raised p-6" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="display mb-1 text-xl">Recent activity</h2>
          <p className="mb-6 text-xs text-muted">Titles you last spent time with</p>
          {data.recent.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              No watch history yet. Pick a title from Browse to start your report.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {data.recent.map((item) => (
                <Link key={item.id} href={`/watch/${item.titleId}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-90">
                  <div className="poster-shell h-12 w-9 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${item.thumbnailUrl})` }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-cream">{item.titleName}</p>
                    <p className="text-xs text-muted">{item.percent}% · {new Date(item.updatedAt).toLocaleDateString()}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink" role="progressbar" aria-valuenow={item.percent} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-accent" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                  <StarIcon className="h-4 w-4 shrink-0 text-accent" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
