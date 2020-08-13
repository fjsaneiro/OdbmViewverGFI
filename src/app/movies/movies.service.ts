
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, Subscription, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from './../../environments/environment';

import { ErrorService } from './../shared/error.service';
import { LoadingService } from './../shared/loading.service';
import { OmdbMovieResponse } from './interfaces/OmdbMovieResponse';
import { OmdbSearchResponse } from './interfaces/OmdbSearchResponse';

@Injectable({providedIn: 'root'})
export class MovieService {
  constructor(private http: HttpClient,
              private loadingService: LoadingService,
              private errorService: ErrorService) {}

  public moviessChanged = new Subject<OmdbSearchResponse>();
  public currentSearch: string;
  public currentPage: number;
  private currentSearchRespone: OmdbSearchResponse;

  public searchMoviesPage(pageNumber: number): void {
    if (this.currentSearch) {
      this.searchMovies(this.currentSearch, pageNumber);
    }
  }

  public searchMovies(search: string, pageNumber: number): void {
    if (search === null) {
      this.errorService.setErrorMessage('Argument search not provided');
      return;
    }

    this.errorService.clearErrorMessage();
    this.loadingService.setLoading(true);

    if (search === this.currentSearch && pageNumber === this.currentPage) {
      this.moviessChanged.next(this.currentSearchRespone);
      this.loadingService.setLoading(false);
      return;
    }

    const params = new HttpParams().append('apikey', environment.OmdbAPIKey)
                                   .append('type', environment.OmdbAPIType)
                                   .append('plot', environment.OmdbAPIPlot)
                                   .append('s', search)
                                   .append('page', pageNumber.toString());

    this.currentSearch = search;
    this.currentPage = pageNumber;
    this.currentSearchRespone = null;
    this.http
      .get<OmdbSearchResponse>(environment.OmdbAPIURL, { params } )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.currentSearchRespone = resData;
          this.moviessChanged.next(resData);
          if (resData.Error) {
            this.errorService.setErrorMessage(resData.Error);
          } else {
            this.errorService.clearErrorMessage();
          }
          this.loadingService.setLoading(false);
        })
      ).subscribe();
  }

  public getMovieDetails(id: string): void {
    if (id === null) {
      this.errorService.setErrorMessage('Argument id not provided');
      return;
    }

    this.errorService.clearErrorMessage();
    this.loadingService.setLoading(true);
    const params = new HttpParams().append('apikey', environment.OmdbAPIKey)
                                   .append('type', environment.OmdbAPIType)
                                   .append('plot', environment.OmdbAPIPlot)
                                   .append('i', id);

    this.http
      .get<OmdbMovieResponse>(environment.OmdbAPIURL, { params } )
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.errorService.clearErrorMessage();
          this.loadingService.setLoading(false);
        })
      ).subscribe();
  }

  private handleError(errorRes: HttpErrorResponse): Observable<never> {
    const errorMessage = 'An unknown error ocurred';
    this.currentSearchRespone = null;
    this.moviessChanged.next(null);
    this.loadingService.setLoading(false);
    this.errorService.setErrorMessage(errorMessage);
    return throwError(errorMessage);
  }

}
