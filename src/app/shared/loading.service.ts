import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class LoadingService {
  public IsLoading = false;
  public loadingChanged = new Subject<boolean>();

  public setLoading(loading: boolean): void {
    this.IsLoading = loading;
    this.loadingChanged.next(loading);
  }
}
