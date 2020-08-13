import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MoviesComponent } from './movies.component';
import { AuthGuard } from '../auth/auth.guard';
import { MovieListComponent } from './movie-list/movie-list.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { MovieDetailEmptyComponent } from './movie-detail-empty/movie-detail-empty.component';
import { MovieSearchComponent } from './movie-search/movie-search.component';
import { MovieItemComponent } from './movie-list/movie-item/movie-item.component';
import { MoviePagesComponent } from './movie-list/movie-pages/movie-pages.component';

const routes: Routes = [
  {
      path: '',
      component: MoviesComponent,
      canActivate: [AuthGuard],
      children: [
          { path: '', component: MovieDetailEmptyComponent },
          { path: ':id', component: MovieDetailComponent },
      ] },
  ];

@NgModule({
    declarations: [
      MoviesComponent,
      MovieListComponent,
      MovieDetailComponent,
      MovieDetailEmptyComponent,
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
