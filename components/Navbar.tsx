import Link from "next/link";
import { ChartIcon, FilmIcon, HomeIcon, ListIcon, ProfilesIcon, SearchIcon, ShieldIcon } from "@/components/Icons";
import { LogoutButton } from "@/components/LogoutButton";
import type { ProfileDTO } from "@/lib/types";

const links = [
  { href: "/browse", label: "Browse", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/watchlist", label: "My List", icon: ListIcon },
  { href: "/dashboard", label: "Activity", icon: ChartIcon },
  { href: "/profiles/manage", label: "Profiles", icon: ProfilesIcon },
];

export function Navbar({
  profile,
  userName,
}: {
  profile: ProfileDTO | null;
  userName: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 md:px-8">
        <Link href="/browse" className="flex shrink-0 items-center gap-2" aria-label="REELROOM home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <FilmIcon className="h-5 w-5" />
          </span>
          <span className="display text-lg font-bold tracking-[0.16em] text-cream">REELROOM</span>
        </Link>

        <nav aria-label="Main navigation" className="rail -mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href} href={href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-raised hover:text-cream"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {profile ? (
            <Link
              href="/profiles" title="Switch profile"
              className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 transition hover:border-accent"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-ink"
                style={{ backgroundColor: profile.avatarColor }}
              >
                {profile.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium md:block">{profile.name}</span>
              {profile.kids && <ShieldIcon className="h-4 w-4 text-good" />}
            </Link>
          ) : (
            <span className="hidden text-sm text-muted md:block">{userName}</span>
          )}
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
