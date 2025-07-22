import { Component } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <div
      *ngIf="visible"
      class="fixed top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 transition-opacity duration-300 text-white text-center"
      [ngClass]="{
        'bg-green-600': type === 'success',
        'bg-red-600': type === 'error',
        'bg-blue-600': type === 'info'
      }"
    >
      {{ message }}
    </div>
  `,
  styles: ``
})
export class Toast {
  message = '';
  visible = false;
  type: 'success' | 'error' | 'info' = 'success';

  show(msg: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
    this.message = msg;
    this.type = type;
    this.visible = true;
    setTimeout(() => this.visible = false, duration);
  }
}
