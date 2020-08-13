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

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.subscription = this.movieService.moviessChanged.subscribe(res => {
      this.movies = res.Search;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
