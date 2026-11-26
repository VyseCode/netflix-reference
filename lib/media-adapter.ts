export interface PlaybackInfo {
  url: string;
  provider: string;
  simulated: boolean;
  note: string;
}

export interface MediaAdapter {
  getPlaybackUrl(input: { titleId: string; episodeId?: string | null }): PlaybackInfo;
}

class PlaceholderMediaAdapter implements MediaAdapter {
  getPlaybackUrl({ titleId, episodeId }: {
    titleId: string;
    episodeId?: string | null;
  }): PlaybackInfo {
    return {
      url: `/media/placeholder-reel?title=${encodeURIComponent(titleId)}${episodeId ? `&episode=${encodeURIComponent(episodeId)}` : ""}`,
      provider: "placeholder",
      simulated: true,
      note: "Simulated playback: the player advances progress locally and persists it through the progress API.",
    };
  }
}

export const mediaAdapter: MediaAdapter = new PlaceholderMediaAdapter();
