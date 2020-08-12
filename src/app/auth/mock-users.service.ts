import { Injectable } from '@angular/core';
import { User } from './user.module';

@Injectable({providedIn: 'root'})
export class MockUsersService {
  private users: string[] = [];

  public findUser(emaiL: string): boolean {
    return !!this.users.find((x) => x === emaiL);
  }

  public addUser(emaiL: string): void {
    this.users.push(emaiL);
  }

}
