import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { OmdbMovieResponse } from './interfaces/OmdbMovieResponse';

@Injectable({providedIn: 'root'})
export class FavoriteService {
  public favoritesChanged = new Subject<void>();
  public currentSearch: string;
  public currentPage: number;
  private favorites: OmdbMovieResponse[] = [];
  private currentUser: string;

  constructor(private authService: AuthService) {
    this.authService.user.subscribe(user => {
      if (user) {
        if (user.email !== this.currentUser) {
          this.loadFavorites(user.email);
        }
        this.currentUser = user.email;
      } else {
        this.currentUser = null;
        this.favorites = [];
      }
    });
  }

  public getFavorites(): OmdbMovieResponse[] {
    if (!this.currentUser) {
      return [];
    }
    return JSON.parse(JSON.stringify(this.favorites));
  }

  public findFavorite(imdbID: string): boolean {
    return !!this.favorites.find((x) => x.imdbID === imdbID);
  }

  public addFavorite(movie: OmdbMovieResponse): void {
    if (!this.currentUser) {
      return;
    }
    if (movie && movie.imdbID && !this.findFavorite(movie.imdbID)) {
      this.favorites.push(movie);
      this.saveFavorites(this.currentUser);
    }
  }

  public removeFavorite(imdbID: string): void {
    if (!this.currentUser) {
      return;
    }
    if (imdbID && this.findFavorite(imdbID)) {
      this.favorites.splice(this.favorites.findIndex(x => x.imdbID === imdbID), 1);
      this.saveFavorites(this.currentUser);
    }
  }

  private loadFavorites(email: string): void {
    this.favorites = [];
    const json = localStorage.getItem('oMDBFavorites' + email);
    if (json) {
      this.favorites =  JSON.parse(json);
    }
  }
  private saveFavorites(email: string): void {
    localStorage.setItem('oMDBFavorites' + email, JSON.stringify(this.favorites));
  }

}
