import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgIf],
  templateUrl: './navbar.html',
  styles: ``
})
export class Navbar {
  accountDropdownOpen = false;

  constructor(private router: Router) {}

  get isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
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
    localStorage.clear();
    this.closeAccountDropdown();
    this.router.navigate(['/']);
  }
}
