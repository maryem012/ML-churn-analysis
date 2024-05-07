import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  
}
