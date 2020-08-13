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

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private movieService: MovieService,
              private loadingService: LoadingService) { }

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
          this.details = details;
        }
      );
  }

  public navigateBack(): void {
    this.router.navigate(['/movies']);
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
