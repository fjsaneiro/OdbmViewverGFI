import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthService } from './../../auth/services/auth.service';
import { OmdbMovieResponse } from './../interfaces/OmdbMovieResponse';

@Injectable({providedIn: 'root'})
export class FavoriteService {
  public favoritesChanged = new Subject<void>();
  public currentSearch: string;
  private favorites: OmdbMovieResponse[] = [];
  private currentUser: string;

  public totalPages = 0;
  public pageSize = 10;
  public currentPage = 1;

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

  public changePage(pageNumber: number): void
  {
    if (!this.currentUser && pageNumber > this.totalPages || pageNumber === this.currentPage) {
      return;
    }
    this.currentPage = pageNumber;    this.favoritesChanged.next();
  }

  public getFavorites(): OmdbMovieResponse[] {
    if (!this.currentUser) {
      return [];
    }
    const favoritePage = this.favorites.slice((this.currentPage  - 1) * this.pageSize, this.currentPage  * this.pageSize);
    return JSON.parse(JSON.stringify(favoritePage));
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
      this.calculatePagination();
    }
  }

  public removeFavorite(imdbID: string): void {
    if (!this.currentUser) {
      return;
    }
    if (imdbID && this.findFavorite(imdbID)) {
      this.favorites.splice(this.favorites.findIndex(x => x.imdbID === imdbID), 1);
      this.saveFavorites(this.currentUser);
      this.calculatePagination();
    }
  }

  private loadFavorites(email: string): void {
    this.favorites = [];
    const json = localStorage.getItem('oMDBFavorites' + email);
    if (json) {
      this.favorites =  JSON.parse(json);
      this.calculatePagination();
    }
  }

  private saveFavorites(email: string): void {
    localStorage.setItem('oMDBFavorites' + email, JSON.stringify(this.favorites));
  }

  private calculatePagination(): void {
    if (this.favorites) {
      this.totalPages = Math.ceil(this.favorites.length / this.pageSize);
    }
  }


}
