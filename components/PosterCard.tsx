import Link from "next/link";
import { PlayIcon, ShieldIcon, StarIcon } from "@/components/Icons";
import type { TitleDTO } from "@/lib/types";

export function PosterCard({
  title,
  progressPercent,
  matchScore,
  reason,
}: {
  title: TitleDTO;
  progressPercent?: number;
  matchScore?: number;
  reason?: string;
}) {
  return (
    <Link
      href={`/title/${title.id}`}
      className="group block w-44 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:w-48"
      aria-label={`${title.title}, ${title.year}, rated ${title.maturityLabel}`}
    >
      <div
        className="poster-shell relative aspect-[2/3] overflow-hidden rounded-xl border border-line transition duration-200 group-hover:-translate-y-1 group-hover:border-accent"
        style={{ backgroundImage: `url(${title.thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {typeof matchScore === "number" && (
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-ink">{matchScore}% match</span>
          )}
          {title.type === "series" && (
            <span className="rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-cream">SERIES</span>
          )}
        </div>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-cream">
          <StarIcon className="h-3 w-3 text-accent" /> {title.rating.toFixed(1)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="display line-clamp-2 text-sm font-bold leading-tight text-cream">{title.title}</p>
          <p className="mt-1 flex items-center gap-2 text-[11px] text-muted">
            <span>{title.year}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><ShieldIcon className="h-3 w-3" /> {title.maturityLabel}</span>
          </p>
          {typeof progressPercent === "number" && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-cream/20" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-ink">
            <PlayIcon className="h-5 w-5" />
          </span>
        </span>
      </div>
      {reason && <p className="mt-2 line-clamp-1 text-[11px] text-muted">{reason}</p>}
    </Link>
  );
}
