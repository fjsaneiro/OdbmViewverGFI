import { Component, OnInit, Input } from '@angular/core';

import { OmdbMovieResponse } from './../../interfaces/OmdbMovieResponse';

@Component({
  selector: 'app-movie-item',
  templateUrl: './movie-item.component.html',
  styleUrls: ['./movie-item.component.css']
})
export class MovieItemComponent implements OnInit {
  @Input() movie: OmdbMovieResponse;

  constructor() { }

  public ngOnInit(): void {
  }

}
