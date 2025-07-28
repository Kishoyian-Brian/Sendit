import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ContactService, ContactForm } from '../../../services/contact.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Navbar, Footer, FormsModule, Toast],
  templateUrl: './home.html',
  styles: ``
})
export class Home {
  trackingNumber = '';
  @ViewChild('toast') toast!: Toast;

  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };
  
  isSubmittingContact = false;

  constructor(
    private router: Router, 
    private userService: UserService,
    private contactService: ContactService
  ) {}

  trackParcel() {
    if (!this.trackingNumber) {
      this.toast.show('Please enter a tracking number.', 'error');
      return;
    }
    this.userService.trackParcel(this.trackingNumber).subscribe({
      next: (result) => {
        // Navigate to the map view if valid
        this.router.navigate(['/map-view', this.trackingNumber]);
      },
      error: (error) => {
        this.toast.show('Invalid tracking number.', 'error');
      }
    });
  }

  register() {
    // Add your registration logic here (e.g., navigate to register page)
    alert('Go to Register');
  }

  sendNow() {
    // Add your send now logic here (e.g., navigate to send page)
    alert('Send Now');
  }

  submitContactForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }

    if (this.contactForm.message.length < 10) {
      this.toast.show('Message must be at least 10 characters long.', 'error');
      return;
    }

    this.isSubmittingContact = true;

    this.contactService.submitContactForm(this.contactForm).subscribe({
      next: (response) => {
        this.isSubmittingContact = false;
        if (response.success) {
          this.toast.show(response.message, 'success');
          // Reset form
          this.contactForm = {
            name: '',
            email: '',
            message: ''
          };
        } else {
          this.toast.show(response.message, 'error');
        }
      },
      error: (error) => {
        this.isSubmittingContact = false;
        console.error('Contact form submission error:', error);
        this.toast.show('Failed to send message. Please try again later.', 'error');
      }
    });
  }
}
