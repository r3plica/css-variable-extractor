import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,

  imports: [CommonModule, RouterModule],
})
export class NavbarComponent {
  navbarOpen = false;

  public setNavbarOpen() {
    this.navbarOpen = !this.navbarOpen;
  }
}
