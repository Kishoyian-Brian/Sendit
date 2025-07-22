import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [NgIf],
  templateUrl: './navbar.html',
  styles: ``
})
export class Navbar {
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
    this.authService.logout(this.router);
    this.closeAccountDropdown();
  }
}
