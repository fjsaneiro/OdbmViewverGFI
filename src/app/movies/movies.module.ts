import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MoviesComponent } from './movies.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
      path: '',
      component: MoviesComponent,
      canActivate: [AuthGuard],
      children: [
          { path: '', component: MoviesComponent },
      ] },
  ];

@NgModule({
    declarations: [
      MoviesComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class MoviesModule {}
