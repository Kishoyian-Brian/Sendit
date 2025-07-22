import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { Parcel } from '../../../models/parcel.model';

@Component({
  selector: 'app-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './track-parcel.html',
  styles: ''
})
export class TrackParcel {
  trackingNumber = '';
  foundParcel: Parcel | null = null;
  errorMessage = '';
  faqs = [
    {
      question: 'What Is a Tracking Number & Where Can I Find It?',
      answer: 'A tracking number is a unique code assigned to your parcel that allows you to monitor its journey. It is usually provided via email or SMS when your parcel is dispatched.',
      open: false
    },
    {
      question: 'When will my tracking information appear?',
      answer: 'Tracking details are typically available within a few hours of shipping. If you don’t see it yet, please wait a bit and refresh.',
      open: false
    },
    {
      question: 'Why is my tracking number/ID not working?',
      answer: 'Make sure the number was entered correctly. If the problem persists, the parcel may not have been scanned yet. Contact support if it continues.',
      open: false
    },
    {
      question: 'If I do not have my tracking number, is it still possible to track my shipment?',
      answer: 'Yes. You can track it using your account login details and parcel history. Contact customer support for assistance.',
      open: false
    }
  ];

  toggleFaq(faq: any) {
    faq.open = !faq.open;
  }

  trackParcel() {
    this.errorMessage = '';
    this.foundParcel = null;
    if (!this.trackingNumber) {
      this.errorMessage = 'Please enter a tracking number.';
      return;
    }
    // Backend-ready: swap this for an API call in the future
    const parcels: Parcel[] = JSON.parse(localStorage.getItem('admin_parcels') || '[]');
    const found = parcels.find((p) => p.trackingNumber === this.trackingNumber);
    if (found) {
      this.foundParcel = found;
    } else {
      this.errorMessage = 'Parcel not found. Please check your tracking number.';
    }
  }
}
