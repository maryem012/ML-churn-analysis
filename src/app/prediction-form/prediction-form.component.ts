import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PredictionService } from '../prediction.service';
interface UserInput {
  tenure: number;
  monthlyCharges: number;
  numTechTickets: number;
  internetService: string;
  onlineSecurity: string;
  onlineBackup: string;
  deviceProtection: string;
  techSupport: string;
  contract: string;
  paperlessBilling: string;
  paymentMethod: string;
}

interface PredictionResponse {
  prediction: 'Churn' | 'No Churn';
}
@Component({
  selector: 'app-prediction-form',
  templateUrl: './prediction-form.component.html',
  styleUrl: './prediction-form.component.css'
})
export class PredictionFormComponent {
  userInput: UserInput = {
    tenure: 0,
    monthlyCharges: 0,
    numTechTickets: 0,
    internetService: '',
    onlineSecurity: '',
    onlineBackup: '',
    deviceProtection: '',
    techSupport: '',
    contract: '',
    paperlessBilling: '',
    paymentMethod: ''
  };

  prediction: string | null = null;

  constructor(private predictionService: PredictionService,    private router: Router
    ) { }
  visible: boolean = false;

  showDialog() {
      this.visible = true;
  }
  onSubmit(): void {
    const inputData = {
      tenure: Number(this.userInput.tenure),
      MonthlyCharges: Number(this.userInput.monthlyCharges),
      numTechTickets: Number(this.userInput.numTechTickets),
      ['InternetService_Fiber optic']: this.userInput.internetService === 'Fiber optic' ? 1 : 0,
      OnlineSecurity_No: this.userInput.onlineSecurity === 'No' ? 1 : 0,
      OnlineBackup_No: this.userInput.onlineBackup === 'No' ? 1 : 0,
      DeviceProtection_No: this.userInput.deviceProtection === 'No' ? 1 : 0,
      TechSupport_No: this.userInput.techSupport === 'No' ? 1 : 0,
      ['Contract_Month-to-month']: this.userInput.contract === 'Month-to-month' ? 1 : 0,
      ['Contract_One year']: this.userInput.contract === 'One year' ? 1 : 0,
      PaperlessBilling_No: this.userInput.paperlessBilling === 'No' ? 1 : 0,
      PaperlessBilling_Yes: this.userInput.paperlessBilling === 'Yes' ? 1 : 0,
      ['PaymentMethod_Electronic check'] : this.userInput.paymentMethod === 'Electronic check' ? 1 : 0,
      // Additional fields with defaults
      
    };

    console.log('Input Data for Model:', inputData);

    this.predictionService.predictChurn(inputData).subscribe({
      next: (response: PredictionResponse) => {
        this.prediction = `Your churn prediction result for this client is: ${response.prediction}`;
        console.log('Prediction received:', this.prediction); // Added log
        this.showDialog()
      
      },
      
      error: (error: any) => {
        console.error('Error when predicting churn:', error);
        this.prediction = 'Failed to get prediction.';
      }
    });
  }
}
