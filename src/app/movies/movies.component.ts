import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {

  public isFavorites = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) { }

  public ngOnInit(): void {
    this.isFavorites = !this.router.url.startsWith('/movies');
    this.activatedRoute.url.subscribe(url => {
      this.isFavorites = !this.router.url.startsWith('/movies');
    });
  }

}
