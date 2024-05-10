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

  ];
  data: any;

  options: any;

  constructor(private http: HttpClient, private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.initializeCharts();
  }

  initializeCharts(): void {
    this.churnOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            color: '#333'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(tooltipItem: { datasetIndex: string | number; raw: number; }, data: { datasets: { [x: string]: { label: string; }; }; }) {
              let label = data.datasets[tooltipItem.datasetIndex].label || '';
              if (label) {
                label += ': ';
              }
              label += Math.round(tooltipItem.raw * 100) / 100;
              return label;
            }
          }
        },
        title: {
          display: true,
          text: 'Churn Rate Distribution',
          font: {
            size: 20
          }
        }
      }
    };

    this.churnData = {
      labels: ['No CHURN', 'CHURN'],
      datasets: [
        {
          data: [1, 1],  // Example data
          backgroundColor: ['rgba(76, 175, 80, 0.2)', 'rgba(255, 193, 7, 0.2)'],
          hoverBackgroundColor: ['#4CAF50', '#FFC107']
        }
      ]
    };

    this.clvOptions = {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true
        },
        title: {
          display: true,
          text: 'Customer Lifetime Value Distribution',
          font: {
            size: 20
          }
        }
      },
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
      labels: ['Low', 'Medium', 'High', 'Very High'],  // Example labels
      datasets: [
        {
          label: 'Number of Customers',
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
          fill: true,
          tension: 0.1
        }
      ],
      
    };

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    
    this.data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--blue-500')
            },
            {
                label: 'Second Dataset',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                borderDash: [5, 5],
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--teal-500')
            },
            {
                label: 'Third Dataset',
                data: [12, 51, 62, 33, 21, 62, 45],
                fill: true,
                borderColor: documentStyle.getPropertyValue('--orange-500'),
                tension: 0.4,
                backgroundColor: 'rgba(255,167,38,0.2)'
            }
        ]
    };
    
    this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
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
