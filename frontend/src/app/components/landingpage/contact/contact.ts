import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { ContactService, ContactForm } from '../../../services/contact.service';
import { Toast } from '../../toast/toast/toast';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer, Toast],
  templateUrl: './contact.html',
  styles: ``
})
export class Contact {
  @ViewChild('toast') toast!: Toast;
  
  contactForm: ContactForm = {
    name: '',
    email: '',
    message: ''
  };
  
  isSubmitting = false;

  constructor(private contactService: ContactService) {}

  submitForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.toast.show('Please fill in all fields.', 'error');
      return;
    }

    if (this.contactForm.message.length < 10) {
      this.toast.show('Message must be at least 10 characters long.', 'error');
      return;
    }

    this.isSubmitting = true;

    this.contactService.submitContactForm(this.contactForm).subscribe({
      next: (response) => {
        this.isSubmitting = false;
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
        this.isSubmitting = false;
        console.error('Contact form submission error:', error);
        this.toast.show('Failed to send message. Please try again later.', 'error');
      }
    });
  }
}
