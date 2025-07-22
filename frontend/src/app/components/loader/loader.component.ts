import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-700"></div>
    </div>
  `,
  styles: ``
})
export class LoaderComponent {
  @Input() visible = false;
} 