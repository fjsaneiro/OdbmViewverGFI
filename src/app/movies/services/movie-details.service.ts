import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuthService } from './../../auth/services/auth.service';
import { LoadingService } from './../../shared/loading.service';
import { ErrorService } from './../../shared/error.service';
import { environment } from './../../../environments/environment';
import { OmdbMovieDetailResponse } from './../interfaces/OmdbMovieDetailResponse';

@Injectable({providedIn: 'root'})
export class MovieDetailsService {
  constructor(private http: HttpClient,
              private authService: AuthService,
              private loadingService: LoadingService,
              private errorService: ErrorService) {
      this.authService.user.subscribe(user => {
        if (!user) {
          this.currentDetail  = null;
          this.currentDetailResponse  = null;
        }
      });
  }

  public detailChanged = new Subject<OmdbMovieDetailResponse>();

  private currentDetailResponse: OmdbMovieDetailResponse;
  public currentDetail: string;

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
        catchError(this.handleError.bind(this)),
        tap((resData) => {
          this.errorService.clearErrorMessage();
          this.loadingService.setLoading(false);
          this.detailChanged.next(resData);
        })
      ).subscribe();
  }

  private handleError(errorRes: HttpErrorResponse): Observable<never> {
    const errorMessage = 'An unknown error ocurred';
    this.currentDetailResponse = null;
    this.detailChanged.next(null);
    this.loadingService.setLoading(false);
    this.errorService.setErrorMessage(errorMessage);
    this.loadingService.setLoading(false);
    return throwError(errorMessage);
  }

}
