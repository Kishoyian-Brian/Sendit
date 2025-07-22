import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet } from '@angular/router';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loading = false;
  protected title = 'frontend';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      console.log('Router event:', event);
      if (event instanceof NavigationStart) {
        this.loading = true;
        console.log('Loader ON');
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
        console.log('Loader OFF');
      }
    });
  }
}
