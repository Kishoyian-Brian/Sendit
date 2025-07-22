import { Component, ViewChild } from '@angular/core';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, FormsModule, Toast],
  templateUrl: './home.html',
  styles: ``
})
export class Home {
  trackingNumber = '';
  @ViewChild('toast') toast!: Toast;

  constructor(private router: Router, private userService: UserService) {}

  async trackParcel() {
    if (!this.trackingNumber) {
      this.toast.show('Please enter a tracking number.', 'error');
      return;
    }
    const result = await this.userService.trackParcel(this.trackingNumber);
    if (!result.success) {
      this.toast.show('Invalid tracking number.', 'error');
      return;
    }
    // Navigate to the map view if valid
    this.router.navigate(['/map-view']);
  }

  register() {
    // Add your registration logic here (e.g., navigate to register page)
    alert('Go to Register');
  }

  sendNow() {
    // Add your send now logic here (e.g., navigate to send page)
    alert('Send Now');
  }
}
