import { Router, UrlTree, ActivatedRoute } from '@angular/router';
import { OmdbSearchResponse } from './../interfaces/OmdbSearchResponse';
import { MovieService } from './../movies.service';
import { NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-movie-search',
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.css']
})
export class MovieSearchComponent implements OnInit {

  public currentSearch: string;
  constructor(private movieService: MovieService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      if (this.router.url === '/movies') {
        this.currentSearch = this.movieService.currentSearch;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
        return;
    }

    const search = form.value.searchtitle;
    this.movieService.searchMovies(search, 1);
  }

}
