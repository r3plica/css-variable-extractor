import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { FooterComponent, NavbarComponent } from '@components';

@Component({
  selector: 'app-root',
  standalone: true,

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, RouterModule, NavbarComponent, FooterComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private routerEventsSubscription!: Subscription;

  ngOnInit(): void {
    this.routerEventsSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.smoothScrollToTop();
      });
  }

  ngOnDestroy(): void {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
  }

  private smoothScrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
