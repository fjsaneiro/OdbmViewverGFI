import { OmdbSearchResponse } from './../interfaces/OmdbSearchResponse';

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from './../../../environments/environment';
import { AuthService } from './../../auth/services/auth.service';
import { ErrorService } from './../../shared/error.service';
import { LoadingService } from './../../shared/loading.service';
import { CurrentSearch } from './../interfaces/CurrentSearch';


@Injectable({providedIn: 'root'})
export class MovieService {
  constructor(private http: HttpClient,
              private authService: AuthService,
              private loadingService: LoadingService,
              private errorService: ErrorService) {
      this.authService.user.subscribe(user => {
        if (!user) {
          this.currentSearch  = null;
          this.lastListVieved  = null;
          this.currentSearchRespone  = null;
        }
      });
      const json = sessionStorage.getItem('oMDBSearch');
      if (json) {
        this.currentSearch =  JSON.parse(json);
        this.searchMoviesrRepeat();
      }
  }

  public moviesChanged = new Subject<void>();

  private currentSearchRespone: OmdbSearchResponse;
  public currentSearch: CurrentSearch;
  public lastListVieved: string;

  public getCurrentSearch(): OmdbSearchResponse {
    if (this.currentSearchRespone) {
      return JSON.parse(JSON.stringify(this.currentSearchRespone));
    } else {
      return null;
    }
  }

  public searchMoviesrRepeat(): void {
    if (this.currentSearch) {
      this.searchMovies(this.currentSearch.currentText, this.currentSearch.currentPage);
    }
  }

  public searchMoviesPage(pageNumber: number): void {
    if (this.currentSearch) {
      this.searchMovies(this.currentSearch.currentText, pageNumber);
    }
  }

  public searchMovies(search: string, pageNumber: number): void {
    if (search === null) {
      this.errorService.setErrorMessage('Argument search not provided');
      return;
    }

    this.errorService.clearErrorMessage();
    this.loadingService.setLoading(true);

    if (this.currentSearchRespone &&
        !this.currentSearchRespone.Error &&
        this.currentSearch &&
        search === this.currentSearch.currentText &&
        pageNumber === this.currentSearch.currentPage) {
      this.moviesChanged.next();
      this.loadingService.setLoading(false);
      return;
    }

    const params = new HttpParams().append('apikey', environment.OmdbAPIKey)
                                   .append('type', environment.OmdbAPIType)
                                   .append('plot', environment.OmdbAPIPlot)
                                   .append('s', search)
                                   .append('page', pageNumber.toString());

    this.currentSearch = {
      currentText: search,
      currentPage: pageNumber
    };
    this.currentSearchRespone = null;
    this.http
      .get<OmdbSearchResponse>(environment.OmdbAPIURL, { params } )
      .pipe(
        catchError(this.handleError.bind(this)),
        tap((resData) => {
          this.currentSearchRespone = resData;
          this.moviesChanged.next();
          if (resData.Error) {
            this.errorService.setErrorMessage(resData.Error);
          } else {
            sessionStorage.setItem('oMDBSearch', JSON.stringify(this.currentSearch));
            this.errorService.clearErrorMessage();
          }
          this.loadingService.setLoading(false);
        })
      ).subscribe();
  }

  private handleError(errorRes: HttpErrorResponse): Observable<never> {
    const errorMessage = 'An unknown error ocurred';
    this.currentSearchRespone = null;
    this.moviesChanged.next(null);
    this.errorService.setErrorMessage(errorMessage);
    this.loadingService.setLoading(false);
    return throwError(errorMessage);
  }

}
