import json
from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model
model_path = 'C:/Users/ACER/Desktop/ML/random_forest_model.pkl'
model = joblib.load(model_path)


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
        'PaperlessBilling_Yes', 'PaymentMethod_Electronic check'
    ]

    # Ensure all model features are present in the DataFrame
    for feature in model_features:
        if feature not in df.columns:
            df[feature] = 0  # Adding missing features with default 0

    return df[model_features]

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if the uploaded file is an Excel file
    if file and file.filename.endswith(('.xlsx', '.xls')):
        # Read the Excel file using openpyxl engine
        df = pd.read_excel(file, engine='openpyxl')
        # Predict using the preloaded model
        predictions = model.predict(df)
        df['predictions'] = predictions
        # Convert DataFrame to JSON
        return jsonify(df.to_dict(orient='records'))
    else:
        return jsonify({'error': 'Unsupported file format'}), 400
    
  

@app.route('/upload-and-predict', methods=['POST'])
def upload_and_predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        df = pd.read_excel(file, engine='openpyxl')
        # Store original CustomerIDs
        customer_ids = df['customerID'].copy()
        df_preprocessed = preprocess_excel_data(df)
        predictions = model.predict(df_preprocessed)
        # Add predictions and CustomerID to the DataFrame
        df_preprocessed['Predictions'] = predictions
        df_preprocessed['customerID'] = customer_ids
        return jsonify(df_preprocessed[['customerID', 'Predictions']].to_dict(orient='records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#already work no touch 
@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        data = request.get_json(force=True)
        prediction = model.predict(pd.DataFrame([data]))
        return jsonify({'prediction': prediction.tolist()})
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
