export type Maturity = 0 | 7 | 13 | 16 | 18;
export type TitleType = "movie" | "series";

export interface TitleDTO {
  id: string;
  type: TitleType;
  title: string;
  genres: string[];
  year: number;
  rating: number;
  maturity: Maturity;
  maturityLabel: string;
  cast: string[];
  description: string;
  thumbnailUrl: string;
  durationMinutes: number;
  matchScore?: number;
  reason?: string;
}

export interface RecommendationDTO extends TitleDTO {
  matchScore: number;
  reason: string;
}

export interface EpisodeDTO {
  id: string;
  seasonId: string;
  episodeNumber: number;
  name: string;
  description: string;
  durationMinutes: number;
  thumbnailUrl: string;
}

export interface SeasonDTO {
  id: string;
  seasonNumber: number;
  year: number;
  episodeCount: number;
  episodes: EpisodeDTO[];
}

export interface TitleDetailDTO extends TitleDTO {
  seasons: SeasonDTO[];
  inWatchlist: boolean;
  reaction: "like" | "dislike" | null;
}

export interface ProfileDTO {
  id: string;
  name: string;
  avatarColor: string;
  kids: boolean;
  maxRating: Maturity;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export interface BrowseRowDTO {
  id: string;
  title: string;
  subtitle: string;
  items: TitleDTO[];
}

export interface BrowseDTO {
  profile: ProfileDTO;
  rows: BrowseRowDTO[];
  continueWatching: ProgressDTO[];
}

export interface WatchlistDTO {
  id: string;
  titleId: string;
  addedAt: string;
  unavailable: boolean;
  title: TitleDTO | null;
}

export interface ProgressDTO {
  id: string;
  titleId: string;
  titleName: string;
  thumbnailUrl: string;
  type: TitleType;
  episodeId: string | null;
  positionSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
  updatedAt: string;
}

export interface DashboardDTO {
  profile: ProfileDTO;
  totals: {
    watchlist: number;
    liked: number;
    disliked: number;
    started: number;
    completed: number;
    minutesWatched: number;
    seriesFinished: number;
  };
  topGenres: Array<{ genre: string; minutes: number }>;
  recent: ProgressDTO[];
  completionRate: number;
}
