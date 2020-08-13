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
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.subscription = this.movieService.moviessChanged.subscribe(() => {
      const res = this.movieService.getCurrentSearch();
      if (res && !res.Error) {
        this.movies = res.Search;
      }
    });
    this.activatedRoute.url.subscribe(url => {
      if (this.router.url === '/movies') {
        this.movieService.searchMoviesrRepeat();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
