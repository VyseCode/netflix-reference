import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({
  className = "h-5 w-5",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return <Svg {...props}><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" /></Svg>;
}
export function PlusIcon(props: IconProps) {
  return <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>;
}
export function CheckIcon(props: IconProps) {
  return <Svg {...props}><path d="m4.5 12.5 5 5L20 7" /></Svg>;
}
export function CloseIcon(props: IconProps) {
  return <Svg {...props}><path d="M6 6 18 18M18 6 6 18" /></Svg>;
}
export function SearchIcon(props: IconProps) {
  return <Svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></Svg>;
}
export function HomeIcon(props: IconProps) {
  return <Svg {...props}><path d="M3.5 10.5 12 3l8.5 7.5" /><path d="M5.5 9.5V21h13V9.5" /></Svg>;
}
export function ListIcon(props: IconProps) {
  return <Svg {...props}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></Svg>;
}
export function ChartIcon(props: IconProps) {
  return <Svg {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>;
}
export function ProfilesIcon(props: IconProps) {
  return <Svg {...props}><circle cx="8" cy="8" r="3.2" /><path d="M2.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.3" /><path d="M15 15a4.5 4.5 0 0 1 6.5 4.2" /></Svg>;
}
export function ChevronLeft(props: IconProps) {
  return <Svg {...props}><path d="m14.5 5-7 7 7 7" /></Svg>;
}
export function ChevronRight(props: IconProps) {
  return <Svg {...props}><path d="m9.5 5 7 7-7 7" /></Svg>;
}
export function ThumbsUp(props: IconProps) {
  return <Svg {...props}><path d="M7 10.5 11 3a2 2 0 0 1 3.7 1.3L14 9h5.2a2 2 0 0 1 2 2.4l-1.3 7A2 2 0 0 1 18 20H7z" /><path d="M7 10.5H4v9.5h3" /></Svg>;
}
export function ThumbsDown(props: IconProps) {
  return <Svg {...props}><path d="M7 13.5 11 21a2 2 0 0 0 3.7-1.3L14 15h5.2a2 2 0 0 0 2-2.4l-1.3-7A2 2 0 0 0 18 4H7z" /><path d="M7 13.5H4V4h3" /></Svg>;
}
export function StarIcon(props: IconProps) {
  return <Svg {...props}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></Svg>;
}
export function ClockIcon(props: IconProps) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></Svg>;
}
export function ShieldIcon(props: IconProps) {
  return <Svg {...props}><path d="M12 3 4.5 6v5.5c0 4.7 3 8 7.5 9.5 4.5-1.5 7.5-4.8 7.5-9.5V6z" /><path d="m9 12 2 2 4-4" /></Svg>;
}
export function LockIcon(props: IconProps) {
  return <Svg {...props}><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Svg>;
}
export function TrashIcon(props: IconProps) {
  return <Svg {...props}><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" /></Svg>;
}
export function PencilIcon(props: IconProps) {
  return <Svg {...props}><path d="m4 20 4-1 11-11-3-3L5 16z" /><path d="m14.5 6.5 3 3" /></Svg>;
}
export function ArrowRight(props: IconProps) {
  return <Svg {...props}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>;
}
export function FilmIcon(props: IconProps) {
  return <Svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 12h18" /></Svg>;
}
export function LogoutIcon(props: IconProps) {
  return <Svg {...props}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M15 8l4 4-4 4M19 12H9" /></Svg>;
}
export function MenuIcon(props: IconProps) {
  return <Svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
}
export function InfoIcon(props: IconProps) {
  return <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></Svg>;
}
export function SettingsIcon(props: IconProps) {
  return <Svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></Svg>;
}
