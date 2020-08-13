import { OmdbMovieResponse } from './OmdbMovieResponse';

export interface OmdbSearchResponse {
  Search: OmdbMovieResponse [];
  totalResults: number;
  Response: string;
  Error: string;
}
