import { MovieService } from './../movies/services/movies.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/services/auth.service';
import { FavoriteService } from './../movies/services/favorite.services';

@Component({
    selector :'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    public isAuthenticated = false;
    private userSub: Subscription;

    constructor(private router: Router,
                private authService: AuthService,
                private favoritesService: FavoriteService,
                private movieService: MovieService) {}

    public ngOnInit(): void {
        this.userSub = this.authService.user.subscribe(user => {
            this.isAuthenticated = !!user;
        });
    }

    public onLogout(): void {
        this.authService.logout();
    }

    public toMovies(): void {
      this.movieService.searchMoviesPage(1);
      this.router.navigate(['/movies']);
    }

    public toFavorites(): void {
      this.favoritesService.changePage(1);
      this.router.navigate(['/favorites']);
    }

    public ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }

}
