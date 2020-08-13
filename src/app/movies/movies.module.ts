import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MoviesComponent } from './movies.component';
import { AuthGuard } from '../auth/services/auth.guard';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { MovieSearchComponent } from './movie-search/movie-search.component';
import { MovieItemComponent } from './movie-list/movie-item/movie-item.component';
import { MoviePagesComponent } from './movie-list/movie-pages/movie-pages.component';

const routes: Routes = [
  { path: '', component: MoviesComponent, canActivate: [AuthGuard], },
  { path: ':id', component: MovieDetailComponent, canActivate: [AuthGuard], }
];

@NgModule({
    declarations: [
      MoviesComponent,
      MovieListComponent,
      MovieDetailComponent,
      MovieSearchComponent,
      MovieItemComponent,
      MoviePagesComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class MoviesModule {}
