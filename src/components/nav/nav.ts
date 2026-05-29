import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  menuOpen = false;
  darkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.darkMode = localStorage.getItem('theme') === 'dark';
      document.documentElement.classList.toggle('dark', this.darkMode);
    }
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu()  { this.menuOpen = false; }

  toggleDark() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark', this.darkMode);
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }
}