import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  submitContactForm(contactData: ContactForm): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(`${this.API_URL}/contact`, contactData);
  }
} 