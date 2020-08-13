import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ErrorService {
  public ErrorMessage: string = null;
  public ErrorChanged = new Subject<string>();

  public setErrorMessage(ErrorMessage: string): void {
    this.ErrorMessage = ErrorMessage;
    this.ErrorChanged.next(ErrorMessage);
  }

  public clearErrorMessage(): void {
    this.ErrorMessage = null;
    this.ErrorChanged.next(null);
  }
}
