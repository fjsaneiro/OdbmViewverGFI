import { OmdbMovieResponse } from './../interfaces/OmdbMovieResponse';
import { FavoriteService } from './../favorite.services';
import { LoadingService } from './../../shared/loading.service';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap, map, exhaustMap } from 'rxjs/operators';

import { MovieService } from './../movies.service';
import { OmdbMovieDetailResponse } from './../interfaces/OmdbMovieDetailResponse';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  private id: string = null;
  public details: OmdbMovieDetailResponse = null;
  private subscription: Subscription;
  public isFavorite = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private movieService: MovieService,
              private loadingService: LoadingService,
              private favoriteService: FavoriteService) { }

  public ngOnInit(): void {
    this.subscription = this.activatedRoute.params
      .pipe(
        exhaustMap((params: Params) => {
          this.id = params.id;
          this.movieService.getMovieDetails(this.id);
          return this.movieService.detailChanged;
        },
      ))
      .subscribe(
        (details: OmdbMovieDetailResponse) => {
          this.isFavorite = this.favoriteService.findFavorite(this.id);
          this.details = details;
        }
      );
  }

  public removeFavorite(): void {
    this.favoriteService.removeFavorite(this.details.imdbID);
    this.isFavorite = false;
  }

  public addFavorite(): void {
    const movie: OmdbMovieResponse = {
      Title: this.details.Title,
      Year: this.details.Year,
      imdbID: this.details.imdbID,
      Type: this.details.Type,
      Poster: this.details.Poster,
    };
    this.favoriteService.addFavorite(movie);
    this.isFavorite = true;
  }

  public navigateBack(): void {
    if (this.movieService.lastListVieved && this.movieService.lastListVieved === 'favorites') {
      this.router.navigate(['/favorites']);
    } else {
      this.router.navigate(['/movies']);
    }
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
