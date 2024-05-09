import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  constructor(private http: HttpClient) { }

  uploadAndPredict(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>('http://localhost:5001/upload-and-predict', formData);
  }
    predictChurn(inputData: any): Observable<any> {
      // Endpoint URL
      const url = 'http://localhost:5001/predict';
      // Post request to server
      return this.http.post(url, inputData);
    }
    
    getPartialDependence(file: File, feature: string): Observable<any> {
      const formData = new FormData();
      formData.append('file', file);
      // Ensure the feature is correctly added to the URL
      const url = `http://localhost:5001/partial_dependence?feature=${feature}`;
      return this.http.post(url, formData);
    }
    
}
