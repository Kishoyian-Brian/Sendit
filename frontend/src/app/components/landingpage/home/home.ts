import { Component } from '@angular/core';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [Navbar, Footer, FormsModule],
  templateUrl: './home.html',
  styles: ``
})
export class Home {
  trackingNumber = '';

  trackParcel() {
    // Add your tracking logic here (e.g., navigate or call API)
    alert('Tracking: ' + this.trackingNumber);
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
