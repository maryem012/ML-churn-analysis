import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  file: File | null = null;
  predictions: any;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.file = event.target.files[0] || null;
  }

  uploadAndPredict(): void {
    if (!this.file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.file);

    this.http.post<any>('http://localhost:5001/upload-and-predict', formData).subscribe({
      next: (response) => {
        this.predictions = response;
        console.log('Predictions:', this.predictions);
        alert('Prediction successful!');
      },
      error: (error) => {
        console.error('Prediction failed:', error);
        alert('Prediction failed: ' + error.message);
      }
    });
  }
}