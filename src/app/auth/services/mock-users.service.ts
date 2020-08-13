import { Injectable } from '@angular/core';
import { MockUser } from './../models/mock-user.model';

@Injectable({providedIn: 'root'})
export class MockUsersService {
  private users: MockUser[] = [];

  constructor() {
     this.users = JSON.parse(localStorage.getItem('mockUsers'));
     if (this.users == null) {
      this.users = [];
     }
  }

  public findUser(emaiL: string, password: string): boolean {
    return !!this.users.find((x) => x.emaiL === emaiL && x.password == password);
  }

  public addUser(emaiL: string, password: string): void {
    const user = new MockUser(emaiL, password);
    this.users.push(user);
    localStorage.setItem('mockUsers', JSON.stringify(this.users ));
  }

}
