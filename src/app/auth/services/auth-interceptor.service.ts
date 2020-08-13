import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpParams, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, ObservableInput } from 'rxjs';
import { take, exhaustMap, dematerialize, mergeMap, materialize, delay } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { MockUsersService } from './mock-users.service';
import { OmdbSearchResponse } from '../../movies/interfaces/OmdbSearchResponse';
import { OmdbMovieDetailResponse } from './../../movies/interfaces/OmdbMovieDetailResponse';
import { AuthBodyRequest } from './../interfaces/AuthBodyRequest';

interface HttpBodyMock {
  email: string;
  token: string;
  expiresIn: number;
}

type HttpBodyRequest = AuthBodyRequest | void;
type HttpBodyResponse = HttpBodyMock | OmdbMovieDetailResponse | OmdbSearchResponse | void;

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService,
              private mockUsersService: MockUsersService) { }

  private error(message): Observable<never> {
    return throwError({ error: { message } });
  }

  private register(email: string, password: string): Observable<HttpEvent<HttpBodyMock>> {
    const userExists = this.mockUsersService.findUser(email, password);
    if (userExists) {
      return this.error('EMAIL_EXISTS');
    }
    this.mockUsersService.addUser(email, password);
    return this.ok({
      email,
      token: 'jwt-token-mock',
      expiresIn: 20,
    });
  }

  private delayDurationRoute(request: HttpRequest<HttpBodyRequest>): number {
    switch (true) {
      case request.method === 'POST' && request.body && request.body.email && request.url === environment.AuthAPIURL + 'SignUp':
        return 1000;
      case request.method === 'POST' && request.body && request.body.email && request.url === environment.AuthAPIURL + 'Login':
        return 1000;
      default:
        return 0;
    }
  }

  private handleRoute(next: HttpHandler, request: HttpRequest<any>): ObservableInput<any> {
    switch (true) {
      case request.method === 'POST' && request.body.email && request.url === environment.AuthAPIURL + 'SignUp':
        return this.register(request.body.email, request.body.password);
      case request.method === 'POST' && request.body.email && request.url === environment.AuthAPIURL + 'Login':
        return this.authenticate(request.body.email, request.body.password);
      default:
        return next.handle(request);
    }
  }

  private authenticate(email: string, password: string): Observable<HttpEvent<HttpBodyMock>> {

    const userExists = this.mockUsersService.findUser(email, password);
    if (!userExists) {
      return this.error('INVALID_PASSWORD_OR_EMAIL');
    }
    return this.ok({
      email,
      token: 'jwt-token-mock',
      expiresIn: 20,
    });
  }

  private ok(body: HttpBodyMock): Observable<HttpEvent<HttpBodyMock>> {
    return of(new HttpResponse({ status: 200, body }));
  }

  private unauthorized(): Observable<never> {
    return throwError({ status: 401, error: { message: 'Unauthorised' } });
  }

  intercept(
    request: HttpRequest<HttpBodyRequest>,
    next: HttpHandler
  ): Observable<HttpEvent<HttpBodyResponse>> {

    return of(null)
      .pipe(mergeMap(nextValue => this.handleRoute(next, request)))
      .pipe(materialize())
      .pipe(delay(this.delayDurationRoute(request)))
      .pipe(dematerialize());
  }

}
