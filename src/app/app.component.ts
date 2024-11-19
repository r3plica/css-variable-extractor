import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import { FooterComponent, NavbarComponent } from '@components';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, RouterModule, NavbarComponent, FooterComponent],
})
export class AppComponent {}
