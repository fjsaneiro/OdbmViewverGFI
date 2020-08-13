
import { Injectable, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ErrorService } from './../../shared/error.service';
import { LoadingService } from './../../shared/loading.service';
import { User } from './../models/user.model';
import { environment } from '../../../environments/environment';
import { MockUsersService } from './mock-users.service';
import { AuthResponseData } from './../interfaces/AuthResponseData';

@Injectable({providedIn: 'root'})
export class AuthService {
    public user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: number;

    constructor(private http: HttpClient,
                private router: Router,
                private mockUsersService: MockUsersService,
                private loadingService: LoadingService,
                private errorService: ErrorService) {}

    public signup(email: string, password: string): Observable<AuthResponseData> {
        this.errorService.clearErrorMessage();
        this.loadingService.setLoading(true);
        return this.http.post<AuthResponseData>(
               environment.AuthAPIURL +  'SignUp',
               {
                  email,
                  password
               }
        ).pipe(
            catchError(this.handleError.bind(this)),
            tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.token,
                    resData.expiresIn);
                this.loadingService.setLoading(false);
            }));
    }

    public login(email: string, password: string): Observable<AuthResponseData> {
        this.errorService.clearErrorMessage();
        this.loadingService.setLoading(true);
        return this.http.post<AuthResponseData>(
               environment.AuthAPIURL +  'Login',
               {
                  email,
                  password
               }
        ).pipe(
            catchError(this.handleError.bind(this)),
            tap((resData: AuthResponseData) => {
                this.handleAuthentication(
                    resData.email,
                    resData.token,
                    resData.expiresIn);
                this.loadingService.setLoading(false);
            }));
    }

    public autoLogin(): void {
      const userData: {
          email: string,
          ptoken: string,
          expirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
          return;
      }

      const loadedUser = new User(
          userData.email,
          userData.ptoken,
          new Date(userData.expirationDate)
      );

      if (loadedUser.token) {
           this.user.next(loadedUser);
           const expirationDuration = new Date(userData.expirationDate).getTime() - new Date().getTime();
           this.autoLogout(expirationDuration);
      }
   }

    public logout(): void {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
        sessionStorage.clear();
    }

    private autoLogout(expirationDuration: number): void {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        email: string,
        token: string,
        expiresIn: number
    ): void {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 60 * 1000);
        const user = new User(email, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 60 * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
        sessionStorage.clear();
    }

    private handleError(errorRes: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error ocurred';
        if (!errorRes.error || !errorRes.error.message) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exits already.';
                break;
            case 'INVALID_PASSWORD_OR_EMAIL':
                errorMessage = 'This email or password is not valid.';
                break;
        }
        this.errorService.setErrorMessage(errorMessage);
        this.loadingService.setLoading(false);
        return throwError(errorMessage);
    }
}
