import { ErrorService } from './shared/error.service';
import { Subscription } from 'rxjs';
import { LoadingService } from './shared/loading.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OmdbViewver';
  constructor(private authService: AuthService,
              private loadignService: LoadingService,
              private errorService: ErrorService) {}

  public isLoading = false;
  public error: string = null;
  private loadingSubscription: Subscription;
  private errorSubscription: Subscription;

  public ngOnInit(): void {
    this.authService.autoLogin();
    this.isLoading = this.loadignService.IsLoading;
    this.loadingSubscription = this.loadignService.loadingChanged.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
    this.errorSubscription = this.errorService.ErrorChanged.subscribe(errorMessage => {
      this.error = errorMessage;
    });
  }

  public onHandledError(): void {
    this.errorService.clearErrorMessage();
  }

  public ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
}
