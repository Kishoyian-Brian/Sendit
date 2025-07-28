import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, RouterModule],
  templateUrl: './navbar.html',
  styles: ``
})
export class Navbar {
  @Input() dashboardType?: 'admin' | 'driver';
  accountDropdownOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleAccountDropdown() {
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  closeAccountDropdown() {
    this.accountDropdownOpen = false;
  }

  goToLogin() {
    this.closeAccountDropdown();
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.closeAccountDropdown();
    this.router.navigate(['/register']);
  }

  goToParcel() {
    this.closeAccountDropdown();
    this.router.navigate(['/user-dashboard']);
  }

  goToProfile() {
    this.closeAccountDropdown();
    this.router.navigate(['/user-dashboard']);
  }

  logout() {
    this.authService.logout();
    this.closeAccountDropdown();
  }

  scrollToAbout(event: Event) {
    event.preventDefault();
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
      const aboutSection = document.getElementById('about-us');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/'], { fragment: 'about-us' });
    }
  }

  scrollToContact(event: Event) {
    event.preventDefault();
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
      const contactSection = document.getElementById('contact-us');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/'], { fragment: 'contact-us' });
    }
  }

  scrollToHero(event: Event) {
    event.preventDefault();
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate(['/'], { fragment: 'hero-section' });
    }
  }
}
