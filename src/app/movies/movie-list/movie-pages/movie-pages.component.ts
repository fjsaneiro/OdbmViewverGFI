import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { MovieService } from './../../movies.service';

@Component({
  selector: 'app-movie-pages',
  templateUrl: './movie-pages.component.html',
  styleUrls: ['./movie-pages.component.css']
})
export class MoviePagesComponent implements OnInit, OnDestroy {

  public currentPage: number;
  public totalPages: number;
  public pagesShow: number[] = [];
  public showPagination = false;
  private subscription: Subscription;
  private pageSize = 10;

  constructor(private movieService: MovieService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.subscription = this.movieService.moviessChanged.subscribe(res => {
      this.preparePagination();
    });
    this.activatedRoute.url.subscribe(url => {
      if (this.router.url === '/movies') {
        this.preparePagination();
      }
    });
  }

  private preparePagination(): void {
    const paginationRange = 3;
    const res = this.movieService.getCurrentSearch();
    if (!res || res.Error) {
      this.showPagination = false;
      return;
    }
    this.totalPages = Math.ceil(+res.totalResults / this.pageSize);
    this.showPagination = this.totalPages > 1;
    this.currentPage = this.movieService.currentPage;
    this.pagesShow = [];
    for (let i = 1; i <= paginationRange; i++) {
      this.addPagination(i);
    }
    for (let i = this.currentPage - paginationRange; i <= this.currentPage + paginationRange; i++) {
      this.addPagination(i);
    }
    for (let i = this.totalPages - paginationRange; i <= this.totalPages; i++) {
      this.addPagination(i);
    }
  }

  private addPagination(page: number): void {
    if (page >= 1 && page <= this.totalPages && this.pagesShow.indexOf(page) === -1) {
      this.pagesShow.push(page);
    }
  }

  selectPage(page: number): void {
    if (this.currentPage === page) {
      return;
    }
    this.movieService.searchMoviesPage(page);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
