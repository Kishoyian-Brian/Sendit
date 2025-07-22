import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { AuthService } from '../../../services/auth.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer, Toast],
  templateUrl: './login.html',
  styles: ``
})
export class Login {
  email = '';
  password = '';
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private authService: AuthService) {}

  async login() {
    if (!this.email || !this.password) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }
    const result = await this.authService.login(this.email, this.password);
    this.toast.show(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      if (result.type === 'admin') {
        setTimeout(() => this.router.navigate(['/admin-dashboard']), 1500);
      } else if (result.type === 'driver') {
        setTimeout(() => this.router.navigate(['/driver-dashboard']), 1500);
      } else {
        setTimeout(() => this.router.navigate(['']), 1500);
      }
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
