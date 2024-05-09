import json
from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS
from collections import Counter
from sklearn.inspection import partial_dependence

app = Flask(__name__)
CORS(app)

# Load the trained model
model_path = 'C:/Users/ACER/Desktop/ML/random_forest_model.pkl'
model = joblib.load(model_path)
X_train = pd.read_excel('C:/Users/ACER\/desktop/ML/Telecom Churn Rate Dataset.xlsx')


def preprocess_excel_data(df):
    # Mapping columns from Excel format to the model's expected input
    # You will need to add the logic for any columns that require specific transformations
    df['InternetService_Fiber optic'] = (df['InternetService'] == 'Fiber optic').astype(int)
    df['OnlineSecurity_No'] = (df['OnlineSecurity'] == 'No').astype(int)
    df['OnlineBackup_No'] = (df['OnlineBackup'] == 'No').astype(int)
    df['DeviceProtection_No'] = (df['DeviceProtection'] == 'No').astype(int)
    df['TechSupport_No'] = (df['TechSupport'] == 'No').astype(int)
    df['Contract_Month-to-month'] = (df['Contract'] == 'Month-to-month').astype(int)
    df['Contract_One year'] = (df['Contract'] == 'One year').astype(int)
    df['PaperlessBilling_No'] = (df['PaperlessBilling'] == 'No').astype(int)
    df['PaperlessBilling_Yes'] = (df['PaperlessBilling'] == 'Yes').astype(int)
    df['PaymentMethod_Electronic check'] = (df['PaymentMethod'] == 'Electronic check').astype(int)

    # Define the exact features expected by the model
    model_features = [
        'tenure', 'MonthlyCharges', 'numTechTickets',
        'InternetService_Fiber optic', 'OnlineSecurity_No',
        'OnlineBackup_No', 'DeviceProtection_No',
        'TechSupport_No', 'Contract_Month-to-month',
        'Contract_One year', 'PaperlessBilling_No',
        'PaperlessBilling_Yes', 'PaymentMethod_Electronic check',
    ]

    # Ensure all model features are present in the DataFrame
 # Ensure all model features are present in the DataFrame
    for feature in model_features:
        if feature not in df.columns:
            df.loc[:, feature] = 0  # Adding missing features with default 0 using .loc to avoid SettingWithCopyWarning

    return df[model_features]

@app.route('/upload-and-predict', methods=['POST'])
def upload_and_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        df = pd.read_excel(file, engine='openpyxl')
        df_preprocessed = preprocess_excel_data(df)
        predictions = model.predict(df_preprocessed)
        prediction_counts = pd.Series(predictions).value_counts().to_dict()

        return jsonify({'churnYes': prediction_counts.get('Yes', 0),
                        'churnNo': prediction_counts.get('No', 0)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_clv(df):
    # Check for necessary columns
    if 'MonthlyCharges' not in df.columns or 'tenure' not in df.columns:
        raise ValueError("Required columns for CLV calculation are missing")

    df.loc[:, 'CLV'] = df['MonthlyCharges'] * df['tenure']
    return df['CLV']

def categorize_clv(clv_values):
    # Define bins and labels for categorization
    bins = [0, 1000, 5000, 10000, float('inf')]
    labels = ['Low', 'Medium', 'High', 'Very High']
    
    # Use pd.cut to categorize CLV
    clv_categories = pd.cut(clv_values, bins=bins, labels=labels, right=False)
    return clv_categories.value_counts().to_dict()

@app.route('/calculate-clv', methods=['POST'])
def calculate_customer_lifetime_value():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        df = pd.read_excel(file, engine='openpyxl')
        df_preprocessed = preprocess_excel_data(df)
        clv_values = calculate_clv(df_preprocessed)
        clv_categories = pd.cut(clv_values, bins=[0, 1000, 3000, 6000, float('inf')],
                                labels=['Low', 'Medium', 'High', 'Very High'])
        clv_counts = clv_categories.value_counts().to_dict()

        print("CLV counts:", clv_counts)  # Debug print

        return jsonify(clv_counts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500




from flask import jsonify
import logging

@app.route('/partial_dependence', methods=['POST'])
def get_partial_dependence():
    file = request.files['file']
    feature = request.args.get('feature', default='tenure', type=str)

    if file and allowed_file(file.filename):
        try:
            df = pd.read_excel(file)
            df_preprocessed = preprocess_excel_data(df)

            if feature not in df_preprocessed.columns:
                return jsonify({'error': 'Feature not found'}), 404

            pd_results = partial_dependence(model, df_preprocessed, [feature])
            values, average_prediction = pd_results['values'][0], pd_results['average'][0]
            return jsonify({'values': values.tolist(), 'average_prediction': average_prediction.tolist()})
        except Exception as e:
            logging.error(f"Error processing partial dependence: {str(e)}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file or file type'}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ['xlsx', 'xls']

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
