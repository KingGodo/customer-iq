import os

import joblib
from data_utils import prepare_specific_dataset
from model_factory import build_ffnn
import pandas as pd

# --- ADDED IMPORTS FOR CHAPTER 4 METRICS AND GRAPHS ---
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
# ------------------------------------------------------

# Ensure a directory exists for saved models
if not os.path.exists('models'):
    os.makedirs('models')

# Define the datasets we are using
datasets = {
    'bank_marketing': 'bank-full.csv',
    'bank_churn': 'Customer-Churn-Records.csv',
    'telco_churn': 'WA_Fn-UseC_-Telco-Customer-Churn.csv'
}

results_summary = []

for key, filename in datasets.items():
    print(f"\n{'='*30}")
    print(f"PROCESSING: {key.upper()}")
    print(f"{'='*30}")
    
    try:
        # 1. Load and Preprocess
        X_train, X_test, y_train, y_test, preprocessor = prepare_specific_dataset(key)
        
        # 2. Build the Feed-Forward Neural Network
        input_dim = X_train.shape[1]
        model = build_ffnn(input_dim)
        
        # 3. Train
        print(f"Training model for {key}...")
        history = model.fit(
            X_train, y_train,
            epochs=20,
            batch_size=32,
            validation_split=0.1,
            verbose=1
        )
        
        # 4. Evaluate
        metrics = model.evaluate(X_test, y_test, verbose=0)
        acc = metrics[1]
        auc = metrics[2]
        
        print(f"Results for {key}: Accuracy: {acc:.4f}, AUC: {auc:.4f}")

        # --- ADDITIONS FOR CHAPTER 4 START HERE ---
        print("\nGenerating Chapter 4 Metrics & Graphs...")
        
        y_pred_prob = model.predict(X_test, verbose=0)
        y_pred = (y_pred_prob > 0.50).astype(int).flatten()
        
        # Print Classification Report
        print(f"\n--- Classification Report: {key} ---")
        print(classification_report(y_test, y_pred, target_names=['Stay (0)', 'Churn (1)']))
        
        # Calculate Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Save Confusion Matrix Graph
        plt.figure(figsize=(7, 5))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=True,
                    xticklabels=['Predicted Stay', 'Predicted Churn'],
                    yticklabels=['Actual Stay', 'Actual Churn'],
                    annot_kws={"size": 14})
        plt.title(f'Confusion Matrix - {key}', fontsize=16)
        plt.tight_layout()
        plt.savefig(f'models/{key}_confusion_matrix.png', dpi=300)
        plt.close()
        print(f"Saved Confusion Matrix Graph: models/{key}_confusion_matrix.png")

        # Save Training History Graph
        plt.figure(figsize=(12, 5))
        
        # Accuracy Plot
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Training Accuracy', color='blue', linewidth=2)
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy', color='orange', linewidth=2)
        plt.title('Model Accuracy over Epochs', fontsize=14)
        plt.ylabel('Accuracy')
        plt.xlabel('Epoch')
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.6)

        # Loss Plot
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'], label='Training Loss', color='red', linewidth=2)
        plt.plot(history.history['val_loss'], label='Validation Loss', color='green', linewidth=2)
        plt.title('Model Loss over Epochs', fontsize=14)
        plt.ylabel('Loss')
        plt.xlabel('Epoch')
        plt.legend()
        plt.grid(True, linestyle='--', alpha=0.6)

        plt.tight_layout()
        plt.savefig(f'models/{key}_training_history.png', dpi=300)
        plt.close()
        print(f"Saved Training History Graph: models/{key}_training_history.png")
        # --- ADDITIONS FOR CHAPTER 4 END HERE ---
        
        # 5. Store Results for Dissertation Table (Updated with new metrics)
        results_summary.append({
            'Dataset': key,
            'Accuracy': acc,
            'AUC': auc,
            'True Positives': cm[1][1],
            'False Positives': cm[0][1],
            'True Negatives': cm[0][0],
            'False Negatives': cm[1][0]
        })
        
        # 6. Save Model
        model.save(f'models/{key}_model.keras')
        joblib.dump(preprocessor, f'models/{key}_preprocessor.pkl')
    except Exception as e:
        print(f"Error processing {key}: {e}")

# Final Table Output
print("\n" + "="*30)
print("FINAL DISSERTATION SUMMARY")
print("="*30)
summary_df = pd.DataFrame(results_summary)
print(summary_df.to_string(index=False))