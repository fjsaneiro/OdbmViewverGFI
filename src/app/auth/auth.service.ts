import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { User } from './user.module';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MockUsersService } from './mock-users.service';

export interface AuthResponseData {
    email: string;
    expiresIn: number;
    token: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    public user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: number;

    constructor(private http: HttpClient,
                private router: Router,
                private mockUsersService: MockUsersService) {}

    public signup(email: string, password: string): Observable<AuthResponseData> {
        return this.http.post<AuthResponseData>(
               environment.AuthAPIURL +  'SignUp',
               {
                  email,
                  password
               }
        ).pipe(
            catchError(this.handleError),
            tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.token,
                    resData.expiresIn);
            }));
    }

    public login(email: string, password: string): Observable<AuthResponseData> {
        return this.http.post<AuthResponseData>(
               environment.AuthAPIURL +  'Login',
               {
                  email,
                  password
               }
        ).pipe(
            catchError(this.handleError),
            tap((resData: AuthResponseData) => {
                this.handleAuthentication(
                    resData.email,
                    resData.token,
                    resData.expiresIn);
            }));
    }

    autoLogin(): void {
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
           if (!this.mockUsersService.findUser(userData.email)) {
             this.mockUsersService.addUser(userData.email);
           }
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
    }

    autoLogout(expirationDuration: number): void {
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
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
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
        return throwError(errorMessage);
    }
}
