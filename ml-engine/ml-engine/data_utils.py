import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

def prepare_specific_dataset(dataset_key):
    print(f"-> Starting data preparation for: {dataset_key}")
    
    if dataset_key == 'bank_marketing':
        # ADDED 'data/' HERE 👇
        df = pd.read_csv('data/bank-full.csv', sep=';')
        df = df.drop(['duration', 'pdays'], axis=1)
        target = 'y'
        df[target] = df[target].map({'yes': 1, 'no': 0})
        numeric = ['age', 'balance', 'day', 'campaign', 'previous']
        categorical = ['job', 'marital', 'education', 'default', 'housing', 'loan', 'contact', 'month', 'poutcome']

    elif dataset_key == 'bank_churn':
        # ADDED 'data/' HERE 👇
        df = pd.read_csv('data/Customer-Churn-Records.csv')
        # FIX: Added 'Complain' to the drop list to prevent data leakage
        df = df.drop(['RowNumber', 'CustomerId', 'Surname', 'Complain'], axis=1)
        target = 'Exited'
        numeric = ['CreditScore', 'Age', 'Tenure', 'Balance', 'NumOfProducts', 'EstimatedSalary', 'Point Earned']
        # FIX: Removed 'Complain' from the categorical list since we dropped the column
        categorical = ['Geography', 'Gender', 'HasCrCard', 'IsActiveMember', 'Satisfaction Score', 'Card Type']

    elif dataset_key == 'telco_churn':
        # ADDED 'data/' HERE 👇
        df = pd.read_csv('data/WA_Fn-UseC_-Telco-Customer-Churn.csv')
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0)
        df = df.drop(['customerID'], axis=1)
        target = 'Churn'
        df[target] = df[target].map({'Yes': 1, 'No': 0})
        numeric = ['tenure', 'MonthlyCharges', 'TotalCharges']
        categorical = ['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines', 
                       'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 
                       'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod']

    X = df.drop(target, axis=1)
    y = df[target]

    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical)
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"-> Transforming features for {dataset_key}...")
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    print(f"-> Successfully prepared {dataset_key}. Input shape: {X_train_proc.shape[1]}")
    return X_train_proc, X_test_proc, y_train, y_test, preprocessor