import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilmIcon, ListIcon, PlayIcon, ShieldIcon } from "@/components/Icons";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "REELROOM — Your screen, your stories",
};

const featured = [
  { src: "/posters/orbit.svg", label: "Orbit Nine" },
  { src: "/posters/tide.svg", label: "Harbor Lights" },
  { src: "/posters/canopy.svg", label: "Wildwood Chronicles" },
  { src: "/posters/ember.svg", label: "The Furnace Room" },
  { src: "/posters/prism.svg", label: "The Observatory" },
];

export default async function HomePage() {
  if (await getSession()) redirect("/browse");

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <FilmIcon />
          </span>
          <span className="display text-xl font-bold tracking-[0.18em]">REELROOM</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-cream hover:bg-raised">Sign in</Link>
          <Link href="/register" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-bright">Get started</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1300px] items-center gap-12 px-5 pb-16 pt-10 md:px-10 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            A streaming experience, thoughtfully rebuilt
          </p>
          <h1 className="display mb-6 text-5xl leading-[1.05] md:text-7xl">
            Your screen.<br />Your stories.
          </h1>
          <p className="mb-9 max-w-xl text-lg leading-relaxed text-muted">
            Personal profiles that stay separate, a watchlist that remembers, recommendations that learn
            from what you actually finish, and parental controls that mean something.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-ink hover:bg-accent-bright">
              Create an account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 rounded-xl border border-line px-6 py-3 font-semibold text-cream hover:border-accent">
              <PlayIcon className="h-4 w-4" /> Explore the demo
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">Demo account: alex@reelroom.dev / password123</p>
        </div>
        <div className="grid grid-cols-5 gap-2 md:gap-3" aria-label="Featured titles">
          {featured.map((poster, index) => (
            <div
              key={poster.src}
              role="img"
              aria-label={poster.label}
              className={`poster-shell aspect-[2/3] rounded-xl border border-line bg-cover bg-center ${index === 2 ? "translate-y-6" : index === 4 ? "-translate-y-4" : ""}`}
              style={{ backgroundImage: `url(${poster.src})` }}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-raised">
        <div className="mx-auto grid max-w-[1300px] gap-8 px-5 py-14 md:grid-cols-3 md:px-10">
          <div>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-card text-accent"><ShieldIcon /></span>
            <h2 className="display mb-2 text-xl">Room for everyone</h2>
            <p className="text-sm leading-relaxed text-muted">Up to five profiles with independent lists, reactions and watch history. Kids profiles cannot open mature titles.</p>
          </div>
          <div>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-card text-accent"><PlayIcon /></span>
            <h2 className="display mb-2 text-xl">Progress that persists</h2>
            <p className="text-sm leading-relaxed text-muted">Continue watching picks up the exact position, for films and for individual episodes of a series.</p>
          </div>
          <div>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-card text-accent"><ListIcon /></span>
            <h2 className="display mb-2 text-xl">Real recommendations</h2>
            <p className="text-sm leading-relaxed text-muted">Ranking comes from your genres, likes and completed titles — not a random shuffle.</p>
          </div>
        </div>
      </section>
      <footer className="mx-auto max-w-[1300px] px-5 py-8 text-xs text-muted md:px-10">
        REELROOM reference implementation · local data · playback is simulated behind a media adapter
      </footer>
    </main>
  );
}
