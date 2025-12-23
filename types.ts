
export interface Movie {
  id: string;
  title: string;
  description: string;
  rating: string;
  year: number;
  duration: string;
  genres: string[];
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  is4K: boolean;
}

export interface Recommendation {
  title: string;
  reason: string;
}
