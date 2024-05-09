import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PredictionService } from '../prediction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  file: File | null = null;
  predictions: any;
  clvData: any; // This will hold the CLV chart data
  churnData: any; // This will hold the chart data for churn predictions
  clvOptions: any; // Options for the CLV chart
  churnOptions: any; // Options for the churn chart
  isLoading = false; // Track loading state
  partialDependenceData: any;
  selectedFeature: string = ''; // Default feature for partial dependence
  featureOptions = [
    { label: 'Tenure', value: 'tenure' },
    { label: 'Monthly Charges', value: 'MonthlyCharges' },
    { label: 'totalCharges', value: 'totalCharges' },
    


  ];

  constructor(private http: HttpClient, private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.initializeCharts();
  }

  initializeCharts(): void {
    this.churnOptions = {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: '#333'
          }
        }
      }
    };

    this.churnData = {
      labels: ['No CHURN', 'CHURN'],
      datasets: [
        {
          data: [1, 1], // Placeholder data
          backgroundColor: ['rgba(76, 175, 80, 0.2)', 'rgba(255, 193, 7, 0.2)'],
          hoverBackgroundColor: ['#4CAF50', '#FFC107']
        }
      ]
    };

    this.clvOptions = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Customer Lifetime Value'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Customers'
          }
        }
      }
    };

    this.clvData = {
      labels: [],
      datasets: [
        {
          label: 'Customer Number',
          data: [100, 1000, 1400, 1900],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    this.partialDependenceData = {
      labels: [],
      datasets: [
        {
          label: 'Average Prediction',
          data: [],
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.5)',
          fill: false,
          tension: 0.1
        }
      ]
    };
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0] || null;
  }

  uploadAndPredict(): void {
    if (!this.file) {
      alert('Please select a file to upload.');
      return;
    }

    this.isLoading = true; // Set loading state
    const formData = new FormData();
    formData.append('file', this.file);

    this.http.post<any>('http://localhost:5001/upload-and-predict', formData).subscribe({
      next: (response) => {
        this.updateChurnChartData(response);
        this.calculateCLV();
        this.loadPartialDependence(this.selectedFeature);
        this.isLoading = false; // Reset loading state
      },
      error: (error) => {
        console.error('Prediction failed:', error);
        alert('Prediction failed: ' + error.message);
        this.isLoading = false; // Reset loading state
      }
    });
  }

  calculateCLV(): void {
    if (!this.file) {
      alert('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.file);
  
    this.http.post<any>('http://localhost:5001/calculate-clv', formData).subscribe({
      next: (response) => {
        this.updateClvChartData(response);
        console.log('CLV Data:', response);
      },
      error: (error) => {
        console.error('CLV calculation failed:', error);
        alert('CLV calculation failed: ' + error.message);
      }
    });
  }

  updateClvChartData(clvCategories: any): void {
    if (!clvCategories || typeof clvCategories !== 'object') {
      console.error('Invalid CLV data:', clvCategories);
      return;
    }
    this.clvData.labels = Object.keys(clvCategories);
    this.clvData.datasets[0].data = Object.values(clvCategories);
    this.clvData = {...this.clvData}; // Trigger change detection for CLV chart
  }

  updateChurnChartData(response: any): void {
    this.churnData.datasets[0].data = [response.churnNo, response.churnYes];
    this.churnData = {...this.churnData}; // Trigger chart update
  }

  loadPartialDependence(feature: string): void {
    if (this.file && feature) {
      console.log("Loading partial dependence for feature:", feature);
      this.predictionService.getPartialDependence(this.file, feature).subscribe({
        next: (response) => {
          this.updatePartialDependenceChart(response);
          console.log("Partial Dependence Data:", response);
        },
        error: (error) => {
          console.error('Failed to load partial dependence:', error);
        }
      });
    } else {
      console.error('File not selected or feature not selected');
    }
  }
  
  onFeatureSelect(event: any): void {
    this.selectedFeature = event.value;  // assuming event.value holds the selected feature name
    this.loadPartialDependence(this.selectedFeature);
  }
  updatePartialDependenceChart(data: any): void {
    this.partialDependenceData.labels = data.values;
    this.partialDependenceData.datasets[0].data = data.average_prediction;
    this.partialDependenceData = {...this.partialDependenceData}; // Ensure chart updates
  }
}
