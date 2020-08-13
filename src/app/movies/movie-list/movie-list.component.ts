import { FavoriteService } from './../favorite.services';
import { ActivatedRoute, Router } from '@angular/router';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MovieService } from './../movies.service';
import { OmdbMovieResponse } from './../interfaces/OmdbMovieResponse';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit, OnDestroy {
  public movies: OmdbMovieResponse[];
  private subscription: Subscription;

  constructor(private movieService: MovieService,
              private favoriteService: FavoriteService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  public ngOnInit(): void {
    if (this.router.url === '/movies') {
      this.subscription = this.movieService.moviesChanged.subscribe(() => {
        this.loadElements();
      });
    } else if (this.router.url === '/favorites') {
      this.subscription = this.favoriteService.favoritesChanged.subscribe(() => {
        this.loadElements();
      });
    }
    this.activatedRoute.url.subscribe(url => {
      this.loadElements();
    });
  }

  private loadElements(): void {
    if (this.router.url === '/movies') {
      this.movieService.lastListVieved = 'movies';
      const res = this.movieService.getCurrentSearch();
      if (res && !res.Error) {
        this.movies = res.Search;
      } else {
        this.movies = [];
      }
    } else if (this.router.url === '/favorites') {
      this.movieService.lastListVieved = 'favorites';
      this.movies = this.favoriteService.getFavorites();
    }
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
