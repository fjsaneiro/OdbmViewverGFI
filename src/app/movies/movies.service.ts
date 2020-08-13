
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, Subscription, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from './../../environments/environment';

import { ErrorService } from './../shared/error.service';
import { LoadingService } from './../shared/loading.service';
import { OmdbMovieDetailResponse } from './interfaces/OmdbMovieDetailResponse';
import { OmdbSearchResponse } from './interfaces/OmdbSearchResponse';

type httpSubject = Subject<void> | Subject<OmdbMovieDetailResponse>;

@Injectable({providedIn: 'root'})
export class MovieService {
  constructor(private http: HttpClient,
              private loadingService: LoadingService,
              private errorService: ErrorService) {}

  public moviessChanged = new Subject<void>();
  public detailChanged = new Subject<OmdbMovieDetailResponse>();
  public currentSearch: string;
  public currentPage: number;
  private currentSearchRespone: OmdbSearchResponse;
  private currentDetailResponse: OmdbMovieDetailResponse;
  public currentDetail: string;

  public getCurrentSearch(): OmdbSearchResponse {
    return JSON.parse(JSON.stringify(this.currentSearchRespone));
  }

  public searchMoviesrRepeat(): void {
    if (this.currentSearch && this.currentPage) {
      this.searchMovies(this.currentSearch, this.currentPage);
    }
  }

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

    if (search === this.currentSearch &&
        pageNumber === this.currentPage &&
        this.currentSearchRespone &&
        !this.currentSearchRespone.Error) {
      this.moviessChanged.next();
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
        catchError(this.handleErrorSearch),
        tap((resData) => {
          this.currentSearchRespone = resData;
          this.moviessChanged.next();
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

    if (id === this.currentDetail && this.currentDetailResponse) {
      this.detailChanged.next(this.currentDetailResponse);
      this.loadingService.setLoading(false);
      return;
    }

    const params = new HttpParams().append('apikey', environment.OmdbAPIKey)
                                   .append('type', environment.OmdbAPIType)
                                   .append('plot', environment.OmdbAPIPlot)
                                   .append('i', id);

    this.http
      .get<OmdbMovieDetailResponse>(environment.OmdbAPIURL, { params } )
      .pipe(
        catchError(this.handleErrorDetails),
        tap((resData) => {
          this.errorService.clearErrorMessage();
          this.loadingService.setLoading(false);
          this.detailChanged.next(resData);
        })
      ).subscribe();
  }

  private handleErrorSearch(errorRes: HttpErrorResponse): Observable<never> {
    return this.handleError(errorRes, this.moviessChanged);
  }

  private handleErrorDetails(errorRes: HttpErrorResponse): Observable<never> {
    return this.handleError(errorRes, this.detailChanged);
  }

  private handleError(errorRes: HttpErrorResponse, subject: httpSubject): Observable<never> {
    const errorMessage = 'An unknown error ocurred';
    this.currentSearchRespone = null;
    subject.next(null);
    this.loadingService.setLoading(false);
    this.errorService.setErrorMessage(errorMessage);
    return throwError(errorMessage);
  }

}
