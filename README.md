# ML Churn Analysis — Telecom Customer Churn Prediction

A full-stack machine-learning web application that predicts customer churn for telecommunications companies. The Angular 17 frontend communicates with a Python/Flask backend to deliver real-time single-customer predictions and batch analytics with interactive visualizations.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install frontend dependencies](#2-install-frontend-dependencies)
  - [3. Start the backend API](#3-start-the-backend-api)
  - [4. Start the Angular development server](#4-start-the-angular-development-server)
- [Application Pages](#application-pages)
  - [Prediction Form (`/`)](#prediction-form-)
  - [Analytics Dashboard (`/dash`)](#analytics-dashboard-dash)
- [Backend API Reference](#backend-api-reference)
- [Input Features](#input-features)
- [Development](#development)
  - [Code scaffolding](#code-scaffolding)
  - [Running unit tests](#running-unit-tests)
  - [Production build](#production-build)
- [Contributing](#contributing)

---

## Overview

Customer churn is one of the most critical challenges in the telecommunications industry. This application leverages a trained machine-learning model to:

- **Predict** whether an individual customer is likely to churn based on their account and service details.
- **Analyse** batch customer data uploaded as a CSV file, visualising churn rates, Customer Lifetime Value (CLV) distribution, and feature partial-dependence plots.

---

## Features

| Feature | Description |
|---|---|
| 🔮 Single-customer prediction | Fill in a form and instantly receive a *Churn / No Churn* prediction. |
| 📁 Batch CSV upload | Upload a CSV file of customer records to get bulk predictions. |
| 📊 Churn rate chart | Pie chart showing the split between churned and retained customers. |
| 💰 CLV distribution chart | Bar chart breaking customers into Low / Medium / High / Very High lifetime-value segments. |
| 📈 Partial dependence plots | Line chart showing how the model's average prediction changes across values of a selected feature (Tenure or Monthly Charges). |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Angular](https://angular.io/) | 17 | SPA framework |
| [TypeScript](https://www.typescriptlang.org/) | ~5.2 | Type-safe JavaScript |
| [Bootstrap](https://getbootstrap.com/) | ^5.3 | Responsive layout & styling |
| [PrimeNG](https://primeng.org/) | ^17 | UI component library (charts, dialogs, dropdowns) |
| [Chart.js](https://www.chartjs.org/) | ^4.4 | Data visualisation |
| [RxJS](https://rxjs.dev/) | ~7.8 | Reactive HTTP communication |

### Backend *(not included in this repo)*
| Technology | Purpose |
|---|---|
| Python / Flask | REST API server |
| scikit-learn | Trained churn-prediction model |

---

## Project Structure

```
ml-churn-analysis/
├── src/
│   ├── app/
│   │   ├── dashboard/              # Analytics dashboard component
│   │   ├── prediction-form/        # Single-customer prediction form
│   │   ├── shared/
│   │   │   └── header/             # Shared header component
│   │   ├── app-routing.module.ts   # Route definitions
│   │   ├── app.module.ts
│   │   ├── prediction.service.ts   # HTTP service (calls Flask API)
│   │   └── layout.service.ts
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Angular CLI** 17: `npm install -g @angular/cli@17`
- **Python** ≥ 3.9 with the Flask backend running on `http://localhost:5001`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/maryem012/ML-churn-analysis.git
cd ML-churn-analysis
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the backend API

The Angular app expects the Flask backend to be available at **`http://localhost:5001`**. Start your Python backend before launching the frontend:

```bash
# Example — adjust to your actual backend project path
cd ../backend
pip install -r requirements.txt
python app.py
```

### 4. Start the Angular development server

```bash
npm start
# or
ng serve
```

Open your browser and navigate to **`http://localhost:4200/`**. The app reloads automatically when source files change.

---

## Application Pages

### Prediction Form (`/`)

Allows you to enter details for a **single customer** and receive an immediate churn prediction.

**Fields:**

| Field | Type | Options |
|---|---|---|
| Tenure (months) | Number | — |
| Monthly Charges ($) | Number | — |
| Number of Tech Tickets | Number | — |
| Internet Service | Dropdown | Fiber optic, None |
| Online Security | Radio | Yes, No |
| Online Backup | Radio | Yes, No |
| Device Protection | Radio | Yes, No |
| Tech Support | Radio | Yes, No |
| Contract | Radio | Month-to-month, One year, Two year |
| Paperless Billing | Radio | Yes, No |
| Payment Method | Dropdown | Electronic check, Mailed check, Credit card (automatic), Bank transfer (automatic) |

After submitting, a dialog displays the result: **"Churn"** or **"No Churn"**.

---

### Analytics Dashboard (`/dash`)

Upload a **CSV file** of customer records to unlock three interactive charts:

1. **Churn Rate Distribution** — Pie chart showing the proportion of churned vs. retained customers.
2. **Customer Lifetime Value Distribution** — Bar chart categorising customers by estimated CLV (Low, Medium, High, Very High).
3. **Partial Dependence Plot** — Line chart illustrating the marginal effect of a selected feature (*Tenure* (`tenure`) or *Monthly Charges* (`MonthlyCharges`)) on the model's average churn prediction.

---

## Backend API Reference

All requests go to the base URL **`http://localhost:5001`**.

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/predict` | Single-customer churn prediction | JSON with feature fields |
| `POST` | `/upload-and-predict` | Batch prediction from CSV | `multipart/form-data` with `file` field |
| `POST` | `/calculate-clv` | Customer Lifetime Value calculation | `multipart/form-data` with `file` field |
| `POST` | `/partial_dependence?feature=<name>` | Partial dependence data for a feature | `multipart/form-data` with `file` field |

### `/predict` request body example

```json
{
  "tenure": 24,
  "MonthlyCharges": 65.5,
  "numTechTickets": 2,
  "InternetService_Fiber optic": 1,
  "OnlineSecurity_No": 0,
  "OnlineBackup_No": 1,
  "DeviceProtection_No": 0,
  "TechSupport_No": 0,
  "Contract_Month-to-month": 0,
  "Contract_One year": 1,
  "PaperlessBilling_No": 0,
  "PaperlessBilling_Yes": 1,
  "PaymentMethod_Electronic check": 0
}
```

### `/predict` response example

```json
{
  "prediction": "No Churn"
}
```

---

## Development

### Code scaffolding

```bash
ng generate component component-name
ng generate service service-name
ng generate directive|pipe|guard|interface|enum|module <name>
```

### Running unit tests

```bash
ng test
```

Executes the unit tests via [Karma](https://karma-runner.github.io).

### Production build

```bash
ng build
```

Build artifacts are stored in the `dist/` directory. Use `--configuration production` for an optimised production bundle.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to your fork: `git push origin feature/your-feature-name`.
5. Open a Pull Request describing your changes.

---

> For more help with the Angular CLI, run `ng help` or visit the [Angular CLI Overview and Command Reference](https://angular.io/cli).
